const FEED_URL = 'https://feeds.bbci.co.uk/news/rss.xml';
const PRIMARY_PROXY = 'https://api.allorigins.win/raw?url='; // simple CORS proxy (may be unreliable)
const SECONDARY_PROXY_PREFIX = 'https://r.jina.ai/http://'; // fallback proxy
const STORAGE_KEY = 'top-news-cache-v1';

function todayStr(){
  return new Date().toISOString().slice(0,10);
}

async function fetchFeed(){
  try{
    const text = await fetchWithFallback();
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0,5).map(item=>({
      title: item.querySelector('title')?.textContent || '',
      link: item.querySelector('link')?.textContent || '#',
      pubDate: item.querySelector('pubDate')?.textContent || '',
      desc: item.querySelector('description')?.textContent || ''
    }));
    const payload = { date: todayStr(), fetchedAt: Date.now(), items };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    render(items);
    updateLastUpdated(payload.fetchedAt);
    scheduleNextUpdate();
  }catch(err){
    console.error('Fetch error', err);
    const cached = getCache();
    if(cached) render(cached.items);
    const el = document.getElementById('last-updated');
    if(cached) el.textContent = 'Unable to fetch — showing cached (if any).';
    else el.textContent = 'Unable to fetch news (no cached data). See console for details.';
  }
}

async function fetchWithFallback(){
  // Try primary proxy first
  try{
    const url = PRIMARY_PROXY + encodeURIComponent(FEED_URL);
    const res = await fetch(url);
    if(res.ok) return await res.text();
    throw new Error(`Primary proxy failed: ${res.status} ${res.statusText}`);
  }catch(primaryErr){
    console.warn('Primary proxy failed, trying secondary...', primaryErr);
    // Try secondary proxy (r.jina.ai) — it expects an http:// URL path
    try{
      const feedPath = FEED_URL.replace(/^https?:\/\//, '');
      const url2 = SECONDARY_PROXY_PREFIX + feedPath;
      const res2 = await fetch(url2);
      if(res2.ok) return await res2.text();
      throw new Error(`Secondary proxy failed: ${res2.status} ${res2.statusText}`);
    }catch(secErr){
      console.warn('Secondary proxy failed, attempting direct fetch...', secErr);
      // Last resort: try direct fetch (may be blocked by CORS in browser)
      const res3 = await fetch(FEED_URL);
      if(res3.ok) return await res3.text();
      throw new Error(`Direct fetch failed: ${res3.status} ${res3.statusText}`);
    }
  }
}

function getCache(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return null;
  try{return JSON.parse(raw);}catch{return null}
}

function render(items){
  const list = document.getElementById('headlines');
  list.innerHTML = '';
  items.forEach((it, idx)=>{
    const li = document.createElement('li');
    li.className = 'item';
    const a = document.createElement('a');
    a.href = it.link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = `<span class="rank">${idx+1}.</span><span class="title">${escapeHtml(it.title)}</span>`;
    li.appendChild(a);
    list.appendChild(li);
  });
}

function escapeHtml(s){
  return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

function updateLastUpdated(ts){
  const el = document.getElementById('last-updated');
  const d = ts ? new Date(ts) : new Date();
  el.textContent = 'Updated: ' + d.toLocaleString();
}

function scheduleNextUpdate(){
  const now = new Date();
  const next = new Date(now);
  next.setHours(24,0,5,0); // a few seconds after midnight local time
  const ms = next - now;
  setTimeout(()=>{ fetchFeed(); }, ms);
}

function init(){
  const cached = getCache();
  if(cached && cached.date === todayStr()){
    render(cached.items);
    updateLastUpdated(cached.fetchedAt);
    scheduleNextUpdate();
  }else{
    fetchFeed();
  }
}

document.addEventListener('DOMContentLoaded', init);
