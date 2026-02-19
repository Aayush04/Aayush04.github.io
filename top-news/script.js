const FEED_URL = 'http://feeds.bbci.co.uk/news/rss.xml';
const PROXY = 'https://api.allorigins.win/raw?url='; // simple CORS proxy
const STORAGE_KEY = 'top-news-cache-v1';

function todayStr(){
  return new Date().toISOString().slice(0,10);
}

async function fetchFeed(){
  try{
    const res = await fetch(PROXY + encodeURIComponent(FEED_URL));
    if(!res.ok) throw new Error('Network response not ok');
    const text = await res.text();
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
    document.getElementById('last-updated').textContent = 'Unable to fetch — showing cached (if any).';
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
