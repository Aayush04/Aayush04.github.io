// ════════════════════════════════════════════════════════════
//  Pair-Match Engine  — DOM-stable architecture
//
//  Key principle: DOM nodes for left items, right slots and
//  pool tiles are created ONCE per question load (buildDOM)
//  and NEVER recreated on interaction. All updates are
//  class/text mutations on existing nodes — zero new
//  listeners added per click/drag.
// ════════════════════════════════════════════════════════════

const SAVE_KEY = 'pair_match_save';
const questions = PAIR_MATCHING;
const TOTAL     = questions.length;

// ── app state ─────────────────────────────────────────────
let current    = 0;
let userMaps   = Array(TOTAL).fill(null);
let revealed   = Array(TOTAL).fill(false);
let score      = { correct: 0, wrong: 0, partial: 0 };
let dropSlots  = {};   // li → ri | null
let poolOrder  = [];   // ri values currently visible in pool
let selectedRi = null; // ri selected from pool (click-mode)

// ── stable DOM node caches — rebuilt once per question ────
let slotEls = [];  // slotEls[li] = .right-drop div
let poolEls = {};  // poolEls[ri] = .tile span

// ── static DOM refs ───────────────────────────────────────
const quizScreen   = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const qNum         = document.getElementById('qNum');
const qInstruction = document.getElementById('qInstruction');
const leftCol      = document.getElementById('leftCol');
const rightCol     = document.getElementById('rightCol');
const poolZone     = document.getElementById('poolZone');
const feedback     = document.getElementById('feedback');
const checkBtn     = document.getElementById('checkBtn');
const clearBtn     = document.getElementById('clearBtn');
const revealBtn    = document.getElementById('revealBtn');
const prevBtn      = document.getElementById('prevBtn');
const nextBtn      = document.getElementById('nextBtn');
const finishBtn    = document.getElementById('finishBtn');
const restartBtn   = document.getElementById('restartBtn');
const scCorrect    = document.getElementById('scCorrect');
const scWrong      = document.getElementById('scWrong');
const scSkipped    = document.getElementById('scSkipped');
const progressFill = document.getElementById('progressFill');
const progressLbl  = document.getElementById('progressLabel');

// ── Pool zone drop/dragover — attached ONCE at startup ────
poolZone.addEventListener('dragover', e => {
  e.preventDefault();
  poolZone.style.borderColor = 'var(--accent2)';
});
poolZone.addEventListener('dragleave', () => {
  poolZone.style.borderColor = '';
});
poolZone.addEventListener('drop', e => {
  e.preventDefault();
  poolZone.style.borderColor = '';
  if (isLocked()) return;
  let d = null;
  try { d = JSON.parse(e.dataTransfer.getData('text/plain')); } catch {}
  if (!d || d.from !== 'slot') return;
  const li = Number(d.li);
  const ri = dropSlots[li];
  if (ri === null || ri === undefined) return;
  dropSlots[li] = null;
  if (!poolOrder.includes(ri)) poolOrder.push(ri);
  selectedRi = null;
  syncAll();
  scheduleSave();
});

// ════════════════════════════════════════════════════════════
//  buildDOM — called ONCE per question.
//  Creates all left items, slot containers and pool tile
//  nodes, attaches event listeners exactly once per node.
// ════════════════════════════════════════════════════════════
function buildDOM(q) {
  slotEls = [];
  poolEls = {};
  leftCol.innerHTML  = '';
  rightCol.innerHTML = '';
  poolZone.innerHTML = '';

  // Left items — static labels, no interaction
  q.left.forEach((text, li) => {
    const div = document.createElement('div');
    div.className = 'left-item';
    div.innerHTML =
      '<span class="idx-badge">' + (li + 1) + '</span>' +
      '<span>' + esc(text) + '</span>';
    leftCol.appendChild(div);
  });

  // Right drop slots — one listener set per slot, never re-added
  q.left.forEach((_, li) => {
    const slot = document.createElement('div');
    slot.className = 'right-drop';

    const ph = document.createElement('span');
    ph.className   = 'drop-placeholder';
    ph.textContent = '— यहाँ रखें —';
    slot.appendChild(ph);

    slot.addEventListener('click', () => onSlotClick(li));
    slot.addEventListener('dragover', e => {
      e.preventDefault();
      if (!isLocked()) slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      if (isLocked()) return;
      let d = null;
      try { d = JSON.parse(e.dataTransfer.getData('text/plain')); } catch {}
      if (d) handleDrop(d, li);
    });

    rightCol.appendChild(slot);
    slotEls[li] = slot;
  });

  // Pool tiles — one per right-side option, shown/hidden via display
  q.right.forEach((text, ri) => {
    const el = document.createElement('span');
    el.className   = 'tile';
    el.textContent = text;

    el.addEventListener('click', () => onPoolTileClick(ri));
    el.draggable = true;
    el.addEventListener('dragstart', e => {
      if (isLocked()) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', JSON.stringify({ from: 'pool', ri: ri }));
      selectedRi = null;
      syncPoolSelection();
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));

    poolZone.appendChild(el);
    poolEls[ri] = el;
  });
}

// ════════════════════════════════════════════════════════════
//  syncAll — mutates class/style/text on EXISTING nodes only.
//  Never creates or destroys the base pool/slot nodes.
//  Slot "placed tile" clones are created here — they are
//  lightweight single-use spans with no persistent listeners.
// ════════════════════════════════════════════════════════════
function syncAll() {
  const q      = questions[current];
  const locked = isLocked();
  const map    = userMaps[current];
  const inPool = new Set(poolOrder);

  // Sync each right drop slot
  q.left.forEach((_, li) => {
    const slot = slotEls[li];
    const ri   = dropSlots[li];
    const ph   = slot.querySelector('.drop-placeholder');

    // Remove any previously placed tile clone
    const prev = slot.querySelector('.tile');
    if (prev) slot.removeChild(prev);

    if (ri !== null && ri !== undefined) {
      const clone = document.createElement('span');
      clone.textContent = q.right[ri];

      if (locked && map) {
        const ok = (q.answer[li] === ri);
        clone.className = 'tile locked-tile ' + (ok ? 'correct-tile' : 'wrong-tile');
        slot.className  = 'right-drop locked ' + (ok ? 'correct-drop' : 'wrong-drop');
      } else {
        clone.className = 'tile placed-tile';
        clone.addEventListener('click', e => {
          e.stopPropagation();
          onPlacedTileClick(li);
        });
        clone.draggable = true;
        clone.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', JSON.stringify({ from: 'slot', li: li }));
          clone.classList.add('dragging');
        });
        clone.addEventListener('dragend', () => clone.classList.remove('dragging'));
        slot.className = 'right-drop';
      }

      if (ph) ph.style.display = 'none';
      slot.appendChild(clone);
    } else {
      if (ph) ph.style.display = '';
      slot.className = 'right-drop' + (locked ? ' locked' : '');
    }
  });

  // Sync pool tiles — show/hide only, update class
  q.right.forEach((_, ri) => {
    const el = poolEls[ri];
    if (!el) return;
    if (inPool.has(ri)) {
      el.style.display = '';
      let cls = 'tile';
      if (locked)           cls += ' locked-tile';
      if (selectedRi === ri) cls += ' selected';
      el.className = cls;
    } else {
      el.style.display = 'none';
      el.className = 'tile';
    }
  });
}

function syncPoolSelection() {
  const q = questions[current];
  q.right.forEach((_, ri) => {
    const el = poolEls[ri];
    if (!el) return;
    if (selectedRi === ri) el.classList.add('selected');
    else el.classList.remove('selected');
  });
}

function isLocked() {
  return revealed[current] || userMaps[current] !== null;
}

// ════════════════════════════════════════════════════════════
//  renderQuestion — sets header text, builds DOM once, syncs
// ════════════════════════════════════════════════════════════
function renderQuestion(idx) {
  const q = questions[idx];

  qNum.innerHTML =
    'Question ' + (idx + 1) +
    ' <small style="color:var(--muted);font-size:.75rem;">/ ' + TOTAL + '</small>' +
    ' &nbsp;<span style="color:var(--accent2);font-size:.82rem;">Q.No. ' + q.sno + '</span>';
  qInstruction.textContent = q.instruction ||
    'नीचे दिए गए बाएँ स्तंभ की प्रत्येक पद को दाएँ स्तंभ से सुमेलित कीजिए।';

  feedback.className   = 'feedback';
  feedback.textContent = '';

  // Reset state for this question
  dropSlots  = {};
  q.left.forEach((_, li) => { dropSlots[li] = null; });
  poolOrder  = shuffle(q.right.map((_, ri) => ri));
  selectedRi = null;

  // Re-apply saved answers if any
  if (userMaps[idx] !== null) {
    Object.keys(userMaps[idx]).forEach(li => {
      const ri = userMaps[idx][Number(li)];
      dropSlots[Number(li)] = ri;
      const pos = poolOrder.indexOf(ri);
      if (pos !== -1) poolOrder.splice(pos, 1);
    });
  }

  buildDOM(q);
  syncAll();

  if (userMaps[idx] !== null) restoreFeedback(idx);
  else setButtons(false);

  prevBtn.disabled = (idx === 0);
  nextBtn.disabled = false;
  updateProgress();
  updateScorePills();
  scheduleSave();
}

// ════════════════════════════════════════════════════════════
//  Interaction handlers
// ════════════════════════════════════════════════════════════
function onPoolTileClick(ri) {
  if (isLocked()) return;
  selectedRi = (selectedRi === ri) ? null : ri;
  syncPoolSelection();
}

function onSlotClick(li) {
  if (isLocked() || selectedRi === null) return;
  const existing = dropSlots[li];
  if (existing !== null && existing !== undefined) {
    if (!poolOrder.includes(existing)) poolOrder.push(existing);
  }
  const pos = poolOrder.indexOf(selectedRi);
  if (pos !== -1) poolOrder.splice(pos, 1);
  dropSlots[li] = selectedRi;
  selectedRi    = null;
  syncAll();
  scheduleSave();
}

function onPlacedTileClick(li) {
  if (isLocked()) return;
  const ri = dropSlots[li];
  if (ri === null || ri === undefined) return;
  dropSlots[li] = null;
  if (!poolOrder.includes(ri)) poolOrder.push(ri);
  selectedRi = null;
  syncAll();
  scheduleSave();
}

function handleDrop(d, targetLi) {
  const existingRi = dropSlots[targetLi];
  if (d.from === 'pool') {
    const ri = Number(d.ri);
    if (existingRi !== null && existingRi !== undefined) {
      if (!poolOrder.includes(existingRi)) poolOrder.push(existingRi);
    }
    const pos = poolOrder.indexOf(ri);
    if (pos !== -1) poolOrder.splice(pos, 1);
    dropSlots[targetLi] = ri;
  } else if (d.from === 'slot') {
    const fromLi = Number(d.li);
    const fromRi = dropSlots[fromLi];
    if (fromRi === null || fromRi === undefined) return;
    dropSlots[targetLi] = fromRi;
    dropSlots[fromLi]   = (existingRi !== undefined) ? existingRi : null;
  }
  selectedRi = null;
  syncAll();
  scheduleSave();
}

// ════════════════════════════════════════════════════════════
//  Check / Reveal / Reset
// ════════════════════════════════════════════════════════════
checkBtn.addEventListener('click',  () => checkAnswer(current));
clearBtn.addEventListener('click',  () => resetQuestion(current));
revealBtn.addEventListener('click', () => revealAnswer(current));

function checkAnswer(idx) {
  const q = questions[idx];
  const anyFilled = q.left.some((_, li) =>
    dropSlots[li] !== null && dropSlots[li] !== undefined);
  if (!anyFilled) { showToast('पहले कुछ जोड़ियाँ रखें'); return; }

  const map = {};
  q.left.forEach((_, li) => {
    if (dropSlots[li] !== null && dropSlots[li] !== undefined) map[li] = dropSlots[li];
  });
  userMaps[idx] = map;

  let correct = 0;
  const total = q.left.length;
  q.left.forEach((_, li) => { if (map[li] === q.answer[li]) correct++; });

  if (correct === total) {
    feedback.className = 'feedback correct';
    feedback.innerHTML = '✓ सभी ' + total + ' जोड़ियाँ सही हैं! बहुत बढ़िया 🎉';
  } else if (correct === 0) {
    feedback.className = 'feedback wrong';
    feedback.innerHTML = '✗ कोई भी जोड़ी सही नहीं।';
  } else {
    feedback.className = 'feedback partial';
    feedback.innerHTML = '◑ ' + correct + ' / ' + total + ' जोड़ियाँ सही हैं।';
  }

  setButtons(true);
  recalcScore();
  updateScorePills();
  syncAll();
  scheduleSave();
}

function revealAnswer(idx) {
  const q = questions[idx];
  revealed[idx] = true;
  const map = {};
  q.left.forEach((_, li) => { dropSlots[li] = q.answer[li]; map[li] = q.answer[li]; });
  poolOrder      = [];
  userMaps[idx]  = map;

  feedback.className = 'feedback correct';
  feedback.innerHTML = '💡 सही उत्तर दिखाए गए हैं।';
  setButtons(true);
  recalcScore();
  updateScorePills();
  syncAll();
  scheduleSave();
}

function resetQuestion(idx) {
  if (revealed[idx]) return;
  const q = questions[idx];
  userMaps[idx] = null;
  dropSlots = {};
  q.left.forEach((_, li) => { dropSlots[li] = null; });
  poolOrder  = shuffle(q.right.map((_, ri) => ri));
  selectedRi = null;
  feedback.className   = 'feedback';
  feedback.textContent = '';
  setButtons(false);
  syncAll();
  recalcScore();
  updateScorePills();
  scheduleSave();
}

function restoreFeedback(idx) {
  const q   = questions[idx];
  const map = userMaps[idx];
  if (!map) return;
  let correct = 0;
  const total = q.left.length;
  q.left.forEach((_, li) => { if (map[li] === q.answer[li]) correct++; });

  if (revealed[idx]) {
    feedback.className = 'feedback correct';
    feedback.innerHTML = '💡 सही उत्तर दिखाए गए हैं।';
  } else if (correct === total) {
    feedback.className = 'feedback correct';
    feedback.innerHTML = '✓ सभी ' + total + ' जोड़ियाँ सही हैं! बहुत बढ़िया 🎉';
  } else if (correct === 0) {
    feedback.className = 'feedback wrong';
    feedback.innerHTML = '✗ कोई भी जोड़ी सही नहीं।';
  } else {
    feedback.className = 'feedback partial';
    feedback.innerHTML = '◑ ' + correct + ' / ' + total + ' जोड़ियाँ सही हैं।';
  }
  setButtons(true);
}

function setButtons(locked) {
  checkBtn.disabled = revealBtn.disabled = clearBtn.disabled = locked;
}

// ════════════════════════════════════════════════════════════
//  Navigation
// ════════════════════════════════════════════════════════════
prevBtn.addEventListener('click',   () => {
  if (current > 0)         { current--; renderQuestion(current); }
});
nextBtn.addEventListener('click',   () => {
  if (current < TOTAL - 1) { current++; renderQuestion(current); }
});
finishBtn.addEventListener('click', showResult);

// ════════════════════════════════════════════════════════════
//  Score helpers
// ════════════════════════════════════════════════════════════
function recalcScore() {
  let c = 0, w = 0, p = 0;
  questions.forEach((q, i) => {
    const map = userMaps[i];
    if (!map) return;
    let correct = 0;
    q.left.forEach((_, li) => { if (map[li] === q.answer[li]) correct++; });
    if (correct === q.left.length) c++;
    else if (correct === 0) w++;
    else p++;
  });
  score = { correct: c, wrong: w, partial: p };
}

function updateScorePills() {
  scCorrect.textContent = score.correct;
  scWrong.textContent   = score.wrong + score.partial;
  scSkipped.textContent = userMaps.filter(m => m === null).length;
}

function updateProgress() {
  const answered = userMaps.filter(m => m !== null).length;
  progressFill.style.width = (TOTAL > 0 ? (answered / TOTAL * 100) : 0) + '%';
  progressLbl.textContent  = answered + ' / ' + TOTAL;
}

// ════════════════════════════════════════════════════════════
//  Result screen
// ════════════════════════════════════════════════════════════
function showResult() {
  quizScreen.style.display   = 'none';
  resultScreen.style.display = 'block';
  recalcScore();
  const skipped = userMaps.filter(m => m === null).length;
  const pct     = TOTAL > 0 ? Math.round(score.correct / TOTAL * 100) : 0;

  document.getElementById('resultSummary').innerHTML =
    '<div class="result-stat"><div class="result-num" style="color:var(--green)">'   + score.correct + '</div><div class="result-lbl">पूर्णतः सही</div></div>' +
    '<div class="result-stat"><div class="result-num" style="color:var(--yellow)">'  + score.partial + '</div><div class="result-lbl">आंशिक सही</div></div>'  +
    '<div class="result-stat"><div class="result-num" style="color:var(--red)">'     + score.wrong   + '</div><div class="result-lbl">गलत</div></div>'         +
    '<div class="result-stat"><div class="result-num" style="color:var(--yellow)">'  + skipped       + '</div><div class="result-lbl">छोड़े</div></div>'        +
    '<div class="result-stat"><div class="result-num">'                              + TOTAL         + '</div><div class="result-lbl">कुल</div></div>'          +
    '<div class="result-stat"><div class="result-num" style="color:var(--accent2)">' + pct + '%'     + '</div><div class="result-lbl">स्कोर</div></div>';

  const tbody = document.getElementById('resultTbody');
  tbody.innerHTML = '';
  questions.forEach((q, i) => {
    const map = userMaps[i];
    q.left.forEach((leftText, li) => {
      const correctRi   = q.answer[li];
      const correctText = q.right[correctRi];
      let statusHtml, userAnswerHtml;

      if (!map || map[li] === undefined || map[li] === null) {
        statusHtml     = '<span class="badge-skipped">○ छोड़ा</span>';
        userAnswerHtml = '<span style="color:var(--muted)">—</span>';
      } else {
        const userRi = map[li];
        const isOk   = (userRi === correctRi);
        statusHtml   = revealed[i]
          ? '<span style="color:var(--accent2);font-weight:700;">💡 Revealed</span>'
          : isOk
            ? '<span class="badge-correct">✓ सही</span>'
            : '<span class="badge-wrong">✗ गलत</span>';
        userAnswerHtml = '<span class="ans-text">' + esc(q.right[userRi]) + '</span>';
      }

      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="sno-badge">' + q.sno + '</span></td>' +
        '<td style="font-size:.85rem;">' + esc(leftText) + '</td>' +
        '<td>' + userAnswerHtml + '</td>' +
        '<td><span style="color:var(--green);font-size:.82rem;">' + esc(correctText) + '</span></td>' +
        '<td>' + statusHtml + '</td>';
      tbody.appendChild(tr);
    });
  });
}

restartBtn.addEventListener('click', init);

// ════════════════════════════════════════════════════════════
//  Save / Load  (debounced 800 ms)
// ════════════════════════════════════════════════════════════
let saveTimer = null;

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        current:   current,
        userMaps:  userMaps,
        revealed:  revealed,
        score:     score,
        dropSlots: dropSlots,
        poolOrder: poolOrder,
        savedAt:   Date.now()
      }));
    } catch (e) {}
  }, 800);
}

function clearSession() {
  localStorage.removeItem(SAVE_KEY);
}

// ════════════════════════════════════════════════════════════
//  Utilities
// ════════════════════════════════════════════════════════════
function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var toastTimer;
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2800);
}

// ════════════════════════════════════════════════════════════
//  Init / Boot
// ════════════════════════════════════════════════════════════
function init() {
  clearSession();
  current    = 0;
  userMaps   = Array(TOTAL).fill(null);
  revealed   = Array(TOTAL).fill(false);
  score      = { correct: 0, wrong: 0, partial: 0 };
  dropSlots  = {};
  poolOrder  = [];
  selectedRi = null;
  quizScreen.style.display   = '';
  resultScreen.style.display = 'none';
  renderQuestion(0);
}

(function boot() {
  try {
    var saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (saved && Array.isArray(saved.userMaps) && saved.userMaps.length === TOTAL) {
      current  = saved.current  || 0;
      userMaps = saved.userMaps;
      revealed = saved.revealed || Array(TOTAL).fill(false);
      score    = saved.score    || { correct: 0, wrong: 0, partial: 0 };
      renderQuestion(current);
      showToast('Progress restored ✓');
      return;
    }
  } catch (e) {}
  init();
})();
