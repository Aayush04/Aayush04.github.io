// ════════════════════════════════════════════════════════════
//  Fill-in-the-Blank Engine
//
//  Blanks in question text are marked by one or more sequences
//  of dots (".............."). Each blank is replaced with a
//  text <input> inline. Users type their answers, then check,
//  clear, or reveal.
//
//  Since there is no answer key in questions3.js the app
//  treats every question as open-ended:
//    • "जाँचें" — saves the typed answers (marks as answered)
//    • "साफ़ करें" — clears inputs for this question
//    • "उत्तर देखें" — marks as revealed (no correct/wrong
//       colouring; inputs are locked to preserve what was typed)
// ════════════════════════════════════════════════════════════

const SAVE_KEY  = 'fillup_save';
const questions = QUESTIONS;
const TOTAL     = questions.length;

// ── Blank marker: one or more groups of 2+ dots ─────────
const BLANK_RE = /\.{2,}/g;

// ── App state ─────────────────────────────────────────────
let current   = 0;
// userAnswers[i] = null | string[]  (one entry per blank in q i)
let userAnswers = Array(TOTAL).fill(null);
let revealed    = Array(TOTAL).fill(false);
let score       = { answered: 0, skipped: 0 };

// ── DOM refs ──────────────────────────────────────────────
const quizScreen   = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const qNum         = document.getElementById('qNum');
const qInstruction = document.getElementById('qInstruction');
const sentenceEl   = document.getElementById('sentenceEl');
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

// ════════════════════════════════════════════════════════════
//  Build the sentence DOM — inline inputs for each blank
// ════════════════════════════════════════════════════════════
function buildSentence(q, inputValues, locked, isRevealed) {
  sentenceEl.innerHTML = '';

  const text   = q.q;
  const parts  = text.split(BLANK_RE);
  const blanks = text.match(BLANK_RE) || [];

  parts.forEach((part, i) => {
    if (part) {
      sentenceEl.appendChild(document.createTextNode(part));
    }
    if (i < blanks.length) {
      const inp = document.createElement('input');
      inp.type        = 'text';
      inp.className   = 'blank-input';
      inp.placeholder = '...';
      inp.dataset.idx = i;
      inp.autocomplete = 'off';
      inp.spellcheck   = false;

      const val = inputValues && inputValues[i] != null ? inputValues[i] : '';
      inp.value = val;

      if (val.trim()) inp.classList.add('answered');

      if (locked) {
        inp.disabled = true;
        if (isRevealed) {
          inp.classList.add('revealed-input');
        }
      } else {
        // Auto-size on input
        inp.addEventListener('input', () => {
          inp.classList.toggle('answered', inp.value.trim().length > 0);
          autoSize(inp);
          scheduleSave();
        });
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Move focus to next blank or check button
            const inputs = Array.from(sentenceEl.querySelectorAll('.blank-input'));
            const pos = inputs.indexOf(inp);
            if (pos < inputs.length - 1) inputs[pos + 1].focus();
            else checkBtn.focus();
          }
        });
      }

      autoSize(inp);
      sentenceEl.appendChild(inp);
    }
  });
}

function autoSize(inp) {
  // Shrink to content; min 80px, max 260px
  const len = Math.max(inp.value.length, inp.placeholder.length, 4);
  inp.style.width = Math.min(Math.max(len * 13 + 24, 80), 260) + 'px';
}

// ════════════════════════════════════════════════════════════
//  Collect current input values from DOM
// ════════════════════════════════════════════════════════════
function collectInputs() {
  return Array.from(sentenceEl.querySelectorAll('.blank-input'))
    .map(inp => inp.value);
}

// ════════════════════════════════════════════════════════════
//  renderQuestion
// ════════════════════════════════════════════════════════════
function renderQuestion(idx) {
  const q = questions[idx];

  qNum.innerHTML =
    'Question ' + (idx + 1) +
    ' <small style="color:var(--muted);font-size:.75rem;">/ ' + TOTAL + '</small>' +
    ' &nbsp;<span style="color:var(--accent2);font-size:.82rem;">Q.No. ' + q.sno + '</span>';
  qInstruction.textContent = q.instruction || 'रिक्त स्थानों की पूर्ति कीजिए।';

  hideFeedback();

  const locked   = userAnswers[idx] !== null;
  const isRev    = revealed[idx];
  const values   = userAnswers[idx];

  buildSentence(q, values, locked, isRev);

  if (locked) {
    showFeedbackForState(idx);
    setButtons(true);
  } else {
    setButtons(false);
  }

  prevBtn.disabled = (idx === 0);
  nextBtn.disabled = false;
  updateProgress();
  updateScorePills();
}

// ════════════════════════════════════════════════════════════
//  Check / Clear / Reveal
// ════════════════════════════════════════════════════════════
checkBtn.addEventListener('click', () => {
  const inputs = Array.from(sentenceEl.querySelectorAll('.blank-input'));
  const vals   = inputs.map(inp => inp.value.trim());
  const anyFilled = vals.some(v => v.length > 0);
  if (!anyFilled) { showToast('पहले रिक्त स्थान भरें'); return; }

  userAnswers[current] = collectInputs();
  setButtons(true);

  // Re-render locked
  buildSentence(questions[current], userAnswers[current], true, false);
  showFeedbackForState(current);
  recalcScore();
  updateScorePills();
  updateProgress();
  scheduleSave();
});

clearBtn.addEventListener('click', () => {
  if (revealed[current]) return;
  userAnswers[current] = null;
  buildSentence(questions[current], null, false, false);
  hideFeedback();
  setButtons(false);
  recalcScore();
  updateScorePills();
  updateProgress();
  scheduleSave();
});

revealBtn.addEventListener('click', () => {
  revealed[current] = true;
  if (!userAnswers[current]) {
    // Save whatever is typed (or empty)
    userAnswers[current] = collectInputs();
  }
  buildSentence(questions[current], userAnswers[current], true, true);
  showFeedbackForState(current);
  setButtons(true);
  recalcScore();
  updateScorePills();
  updateProgress();
  scheduleSave();
});

function showFeedbackForState(idx) {
  const isRev = revealed[idx];
  if (isRev) {
    showFeedback('info', '💡 उत्तर नोट करें और अगले प्रश्न पर जाएँ।');
    return;
  }
  // No answer key — just acknowledge submission
  const vals = userAnswers[idx];
  if (!vals) return;
  const filled = vals.filter(v => (v || '').trim().length > 0).length;
  const total  = vals.length;
  if (filled === total) {
    showFeedback('correct', '✓ सभी ' + total + ' रिक्त स्थान भरे गए।');
  } else if (filled === 0) {
    showFeedback('wrong', '✗ कोई रिक्त स्थान नहीं भरा गया।');
  } else {
    showFeedback('partial', '◑ ' + filled + ' / ' + total + ' रिक्त स्थान भरे गए।');
  }
}

function showFeedback(type, msg) {
  feedback.className = 'feedback show ' + type;
  feedback.textContent = msg;
}
function hideFeedback() {
  feedback.className = 'feedback';
  feedback.textContent = '';
}

function setButtons(locked) {
  checkBtn.disabled = revealBtn.disabled = clearBtn.disabled = locked;
}

// ════════════════════════════════════════════════════════════
//  Navigation
// ════════════════════════════════════════════════════════════
prevBtn.addEventListener('click', () => {
  if (current > 0) { current--; renderQuestion(current); }
});
nextBtn.addEventListener('click', () => {
  if (current < TOTAL - 1) { current++; renderQuestion(current); }
});
finishBtn.addEventListener('click', showResult);

// ════════════════════════════════════════════════════════════
//  Score helpers
// ════════════════════════════════════════════════════════════
function recalcScore() {
  let answered = 0;
  userAnswers.forEach(v => { if (v !== null) answered++; });
  score.answered = answered;
  score.skipped  = TOTAL - answered;
}

function updateScorePills() {
  scCorrect.textContent = score.answered;
  scWrong.textContent   = 0;
  scSkipped.textContent = score.skipped;
}

function updateProgress() {
  const answered = userAnswers.filter(v => v !== null).length;
  progressFill.style.width = (TOTAL > 0 ? answered / TOTAL * 100 : 0) + '%';
  progressLbl.textContent  = answered + ' / ' + TOTAL;
}

// ════════════════════════════════════════════════════════════
//  Result screen
// ════════════════════════════════════════════════════════════
function showResult() {
  quizScreen.style.display   = 'none';
  resultScreen.style.display = 'block';
  recalcScore();

  const skipped = score.skipped;
  const pct     = TOTAL > 0 ? Math.round(score.answered / TOTAL * 100) : 0;

  document.getElementById('resultSummary').innerHTML =
    '<div class="result-stat"><div class="result-num" style="color:var(--accent2)">' + score.answered + '</div><div class="result-lbl">उत्तर दिए</div></div>' +
    '<div class="result-stat"><div class="result-num" style="color:var(--yellow)">'  + skipped       + '</div><div class="result-lbl">छोड़े</div></div>'      +
    '<div class="result-stat"><div class="result-num">'                              + TOTAL         + '</div><div class="result-lbl">कुल</div></div>'          +
    '<div class="result-stat"><div class="result-num" style="color:var(--green)">'   + pct + '%'     + '</div><div class="result-lbl">पूर्णता</div></div>';

  const tbody = document.getElementById('resultTbody');
  tbody.innerHTML = '';

  questions.forEach((q, i) => {
    const vals  = userAnswers[i];
    const isRev = revealed[i];

    // Build a display version of the question with answers substituted
    const parts  = q.q.split(BLANK_RE);
    const blanks = q.q.match(BLANK_RE) || [];
    let qDisplay = '';
    parts.forEach((part, pi) => {
      qDisplay += esc(part);
      if (pi < blanks.length) {
        const userVal = (vals && vals[pi] != null && vals[pi].trim()) ? vals[pi].trim() : null;
        if (userVal) {
          qDisplay += '<span style="color:var(--accent2);font-weight:700;background:rgba(45,212,191,.1);padding:1px 6px;border-radius:5px;">' + esc(userVal) + '</span>';
        } else {
          qDisplay += '<span style="color:var(--muted);font-style:italic;">______</span>';
        }
      }
    });

    let statusHtml;
    if (!vals) {
      statusHtml = '<span class="badge-skipped">○ छोड़ा</span>';
    } else if (isRev) {
      statusHtml = '<span class="badge-revealed">💡 Revealed</span>';
    } else {
      const filled = vals.filter(v => (v || '').trim().length > 0).length;
      statusHtml = filled === blanks.length
        ? '<span class="badge-correct">✓ पूर्ण</span>'
        : '<span class="badge-skipped">◑ आंशिक (' + filled + '/' + blanks.length + ')</span>';
    }

    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td><span class="sno-badge">' + q.sno + '</span></td>' +
      '<td style="font-size:.85rem;line-height:1.8;">' + qDisplay + '</td>' +
      '<td>' + statusHtml + '</td>';
    tbody.appendChild(tr);
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
        current:     current,
        userAnswers: userAnswers,
        revealed:    revealed,
        savedAt:     Date.now()
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
  current     = 0;
  userAnswers = Array(TOTAL).fill(null);
  revealed    = Array(TOTAL).fill(false);
  score       = { answered: 0, skipped: TOTAL };
  quizScreen.style.display   = '';
  resultScreen.style.display = 'none';
  renderQuestion(0);
}

(function boot() {
  try {
    var saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (saved && Array.isArray(saved.userAnswers) && saved.userAnswers.length === TOTAL) {
      current     = saved.current     || 0;
      userAnswers = saved.userAnswers;
      revealed    = saved.revealed    || Array(TOTAL).fill(false);
      recalcScore();
      renderQuestion(current);
      showToast('Progress restored ✓');
      return;
    }
  } catch (e) {}
  init();
})();
