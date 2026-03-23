// ════════════════════════════════════════════════════════════
//  app.js — MCQ Quiz App Logic
//  Depends on: questions.js (must be loaded before this file)
//  Question format:
//    { sno, q, options: {A:..., B:..., C:..., D:...}, answer: "A", category?, explanation? }
// ════════════════════════════════════════════════════════════

// Helper: get ordered [key, value] pairs from a question's options object
function optionEntries(q) {
  return Object.entries(q.options); // [["A","..."], ["B","..."], ...]
}

// Helper: get the 0-based index for an answer key (e.g. "C" → 2)
function keyToIndex(q, key) {
  return Object.keys(q.options).indexOf(key);
}

// Helper: get the answer key for a 0-based index (e.g. 2 → "C")
function indexToKey(q, idx) {
  return Object.keys(q.options)[idx];
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SAVE_KEY = 'mcq_quiz_save';

// ── State ──
let questions = [...QUESTIONS1, ...QUESTIONS2];
let current   = 0;
let answers   = [];   // null = unanswered, string key = chosen answer
let score     = { correct: 0, wrong: 0 };
let mode      = 'quiz';
let shuffleOn = false;

// ── DOM refs ──
const progressFill     = document.getElementById('progressFill');
const progressLabel    = document.getElementById('progressLabel');
const progressPct      = document.getElementById('progressPct');
const qBadge           = document.getElementById('qBadge');
const qCategory        = document.getElementById('qCategory');
const questionText     = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const explanationBox   = document.getElementById('explanation');
const quizCard         = document.getElementById('quizCard');
const flashcardWrap    = document.getElementById('flashcardWrap');
const flashcard        = document.getElementById('flashcard');
const fcQuestion       = document.getElementById('fcQuestion');
const fcAnswer         = document.getElementById('fcAnswer');
const prevBtn          = document.getElementById('prevBtn');
const nextBtn          = document.getElementById('nextBtn');
const scoreCorrect     = document.getElementById('scoreCorrect');
const scoreWrong       = document.getElementById('scoreWrong');
const scoreSkipped     = document.getElementById('scoreSkipped');
const resultScreen     = document.getElementById('result-screen');
const progressWrap     = document.getElementById('progressWrap');
const controls         = document.getElementById('controls');
const shuffleBtn       = document.getElementById('shuffleBtn');
const jumpInput        = document.getElementById('jumpInput');
const jumpBtn          = document.getElementById('jumpBtn');
const finishBtn        = document.getElementById('finishBtn');
const pauseBtn         = document.getElementById('pauseBtn');
const resumeBanner     = document.getElementById('resumeBanner');
const resumeInfo       = document.getElementById('resumeInfo');

// ════════════════════════════════════════════════════════════
//  localStorage  save / load / clear
// ════════════════════════════════════════════════════════════
function saveSession() {
  const data = {
    current,
    answers,
    score,
    mode,
    shuffleOn,
    // store sno order so shuffle can be restored
    questionSnos: questions.map(q => q.sno),
    savedAt: Date.now()
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) { /* storage full — ignore */ }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearSession() {
  localStorage.removeItem(SAVE_KEY);
}

function hasSavedSession() {
  return !!loadSession();
}

// ── Update skipped counter ──
function updateSkipped() {
  scoreSkipped.textContent = answers.filter(a => a === null).length;
}

// ── Show / hide resume banner ──
function lockQuiz()   { document.body.classList.add('quiz-locked'); }
function unlockQuiz() { document.body.classList.remove('quiz-locked'); }

function showResumeBanner(session) {
  const d    = new Date(session.savedAt);
  const when = d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
             + ' ' + d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  const answeredCount = session.answers.filter(a => a !== null).length;
  resumeInfo.textContent =
    `Saved on ${when} · Q${session.current + 1} of ${session.answers.length} · ${answeredCount} answered`;
  resumeBanner.style.display = 'flex';
  lockQuiz();
}

function hideResumeBanner() {
  resumeBanner.style.display = 'none';
  unlockQuiz();
}

// ── Restore a saved session ──
function restoreSession(session) {
  hideResumeBanner();

  // Re-order questions to match the saved sno order
  const allQ = [...QUESTIONS1, ...QUESTIONS2];
  const qMap = Object.fromEntries(allQ.map(q => [q.sno, q]));
  questions = session.questionSnos.map(sno => qMap[sno]).filter(Boolean);

  current   = session.current;
  answers   = session.answers;
  score     = session.score;
  shuffleOn = session.shuffleOn;

  shuffleBtn.classList.toggle('on', shuffleOn);
  shuffleBtn.textContent = shuffleOn ? '🔀 Shuffled' : '🔀 Shuffle';

  scoreCorrect.textContent = score.correct;
  scoreWrong.textContent   = score.wrong;
  updateSkipped();

  resultScreen.style.display = 'none';
  progressWrap.style.display = 'block';
  controls.style.display     = 'flex';

  setMode(session.mode || 'quiz');   // also calls renderQuestion
}

// ── Init (fresh start) ──
function init() {
  clearSession();
  hideResumeBanner();
  answers  = Array(questions.length).fill(null);
  score    = { correct: 0, wrong: 0 };
  current  = 0;
  scoreCorrect.textContent   = '0';
  scoreWrong.textContent     = '0';
  scoreSkipped.textContent   = questions.length;
  resultScreen.style.display = 'none';
  progressWrap.style.display = 'block';
  controls.style.display     = 'flex';
  quizCard.style.display      = mode === 'quiz'      ? 'block' : 'none';
  flashcardWrap.style.display = mode === 'flashcard' ? 'block' : 'none';
  renderQuestion();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Render ──
function renderQuestion() {
  const q     = questions[current];
  const total = questions.length;
  const pct   = Math.round(((current + 1) / total) * 100);

  progressLabel.textContent = `Question ${current + 1} of ${total}`;
  progressPct.textContent   = pct + '%';
  progressFill.style.width  = pct + '%';
  qBadge.textContent        = `Q${current + 1}`;
  qCategory.textContent     = q.category || 'General';
  questionText.textContent  = q.q;

  if (mode === 'flashcard') {
    renderFlashcard(q);
    if (typeof Voice !== 'undefined' && Voice.isOn()) Voice.runVoiceCycle();
    return;
  }

  // Build options
  optionsContainer.innerHTML = '';
  optionEntries(q).forEach(([key, text], i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.key = key;
    btn.innerHTML = `<span class="opt-letter">${key}</span><span>${text}</span>`;
    btn.addEventListener('click', () => selectAnswer(key));
    optionsContainer.appendChild(btn);
  });

  // Restore previous answer if revisiting
  const chosen = answers[current];
  if (chosen !== null) {
    applyAnswerUI(chosen, false);
  } else {
    explanationBox.classList.remove('show');
    explanationBox.textContent = '';
  }

  prevBtn.disabled    = current === 0;
  nextBtn.textContent = current === total - 1 ? 'Finish ✓' : 'Next →';

  // Auto-run voice cycle when voice mode is active
  if (typeof Voice !== 'undefined' && Voice.isOn()) Voice.runVoiceCycle();
}

function renderFlashcard(q) {
  flashcard.classList.remove('flipped');
  fcQuestion.textContent = q.q;
  fcAnswer.textContent   = `${q.answer}. ${q.options[q.answer]}`;
  prevBtn.disabled       = current === 0;
  nextBtn.textContent    = current === questions.length - 1 ? 'Finish ✓' : 'Next →';
}

function selectAnswer(key) {
  if (answers[current] !== null) return; // already answered
  answers[current] = key;
  const isCorrect = key === questions[current].answer;
  if (isCorrect) score.correct++; else score.wrong++;
  scoreCorrect.textContent = score.correct;
  scoreWrong.textContent   = score.wrong;
  updateSkipped();
  applyAnswerUI(key, true);
  saveSession();   // auto-save after every answer
}

function applyAnswerUI(chosenKey, animate) {
  const q    = questions[current];
  const btns = optionsContainer.querySelectorAll('.option-btn');
  btns.forEach(b => (b.disabled = true));

  const chosenBtn = [...btns].find(b => b.dataset.key === chosenKey);
  const correctBtn = [...btns].find(b => b.dataset.key === q.answer);

  if (chosenBtn) chosenBtn.classList.add(chosenKey === q.answer ? 'correct' : 'wrong');
  if (chosenKey !== q.answer && correctBtn) correctBtn.classList.add('correct');

  if (q.explanation) {
    explanationBox.textContent = '💡 ' + q.explanation;
    explanationBox.classList.add('show');
  }
}

// ── Navigation ──
prevBtn.addEventListener('click', () => {
  if (current > 0) { current--; renderQuestion(); saveSession(); }
});

nextBtn.addEventListener('click', () => {
  if (current < questions.length - 1) {
    current++;
    renderQuestion();
    saveSession();   // auto-save on every next
  } else {
    showResult();
  }
});

// ── Flashcard flip ──
flashcardWrap.addEventListener('click', () => flashcard.classList.toggle('flipped'));

// ── Mode switch ──
document.getElementById('btnQuiz').addEventListener('click',  () => setMode('quiz'));
document.getElementById('btnFlash').addEventListener('click', () => setMode('flashcard'));

function setMode(m) {
  mode = m;
  document.getElementById('btnQuiz').classList.toggle('active',  m === 'quiz');
  document.getElementById('btnFlash').classList.toggle('active', m === 'flashcard');
  quizCard.style.display      = m === 'quiz'      ? '' : 'none';
  flashcardWrap.style.display = m === 'flashcard' ? '' : 'none';
  if (m === 'flashcard') flashcard.classList.remove('flipped');
  renderQuestion();
}

// ── Shuffle ──
shuffleBtn.addEventListener('click', () => {
  shuffleOn = !shuffleOn;
  shuffleBtn.classList.toggle('on', shuffleOn);
  shuffleBtn.textContent = shuffleOn ? '🔀 Shuffled' : '🔀 Shuffle';
  if (typeof Voice !== 'undefined') Voice.stopAll();
  questions = shuffleOn
    ? shuffle([...QUESTIONS1, ...QUESTIONS2])
    : [...QUESTIONS1, ...QUESTIONS2];
  current   = 0;
  answers   = Array(questions.length).fill(null);
  score     = { correct: 0, wrong: 0 };
  scoreCorrect.textContent = '0';
  scoreWrong.textContent   = '0';
  renderQuestion();
});

// ── Finish anytime ──
finishBtn.addEventListener('click', () => {
  clearSession();
  showResult();
});

// ── Pause & Save ──
pauseBtn.addEventListener('click', () => {
  saveSession();
  // Visual feedback
  pauseBtn.textContent = '✅ Saved!';
  pauseBtn.disabled = true;
  setTimeout(() => {
    pauseBtn.textContent = '⏸ Pause & Save';
    pauseBtn.disabled = false;
  }, 1800);
});

// ── Jump to question ──
function jumpToQuestion() {
  const val = parseInt(jumpInput.value, 10);
  if (isNaN(val) || val < 1 || val > questions.length) {
    jumpInput.style.borderColor = 'var(--red)';
    setTimeout(() => (jumpInput.style.borderColor = ''), 800);
    return;
  }
  if (typeof Voice !== 'undefined') Voice.stopAll();
  current = val - 1;
  jumpInput.value = '';
  jumpInput.blur();
  renderQuestion();
  saveSession();
}

jumpBtn.addEventListener('click', jumpToQuestion);
jumpInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') jumpToQuestion(); });

// ── Result ──
function showResult() {
  const total   = questions.length;
  const correct = score.correct;
  const wrong   = score.wrong;
  const skipped = answers.filter(a => a === null).length;
  const pct     = Math.round((correct / total) * 100);

  progressWrap.style.display  = 'none';
  quizCard.style.display      = 'none';
  flashcardWrap.style.display = 'none';
  controls.style.display      = 'none';
  resultScreen.style.display  = 'block';

  // Stop any ongoing voice
  if (typeof Voice !== 'undefined') Voice.stopAll();

  document.getElementById('resultPct').textContent = pct + '%';
  document.getElementById('rCorrect').textContent  = correct;
  document.getElementById('rWrong').textContent    = wrong;
  document.getElementById('rSkipped').textContent  = skipped;

  const msgs = [
    [90, "🏆 Outstanding! You're a master!"],
    [70, "🎯 Great job! Almost perfect."],
    [50, "👍 Good effort! Keep practising."],
    [0,  "📖 Keep studying — you'll get there!"]
  ];
  document.getElementById('resultMsg').textContent =
    msgs.find(([threshold]) => pct >= threshold)[1];

  // ── Results table ──
  const tbody = document.getElementById('reviewTableBody');
  tbody.innerHTML = '';

  questions.forEach((q, i) => {
    const chosen = answers[i];
    const isCorrect = chosen === q.answer;
    const isSkipped = chosen === null;

    const statusIcon = isSkipped ? '⏭️' : isCorrect ? '✅' : '❌';

    let yourAnswerHTML;
    if (isSkipped) {
      yourAnswerHTML = `<span class="ri-your-ans-skip">— not answered</span>`;
    } else if (isCorrect) {
      yourAnswerHTML = `<span class="ri-your-ans-ok">${chosen}. ${q.options[chosen]}</span>`;
    } else {
      yourAnswerHTML = `<span class="ri-your-ans-bad">${chosen}. ${q.options[chosen]}</span>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="ri-num">${i + 1}</td>
      <td class="ri-status">${statusIcon}</td>
      <td class="ri-question">${q.q}</td>
      <td class="ri-correct-ans">${q.answer}. ${q.options[q.answer]}</td>
      <td>${yourAnswerHTML}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Restart ──
document.getElementById('restartBtn').addEventListener('click', () => {
  clearSession();
  questions = shuffleOn
    ? shuffle([...QUESTIONS1, ...QUESTIONS2])
    : [...QUESTIONS1, ...QUESTIONS2];
  init();
});

// ── Boot: check for saved session ──
const _savedSession = loadSession();
if (_savedSession) {
  showResumeBanner(_savedSession);
  // Wire up banner buttons (defined in HTML)
  document.getElementById('resumeYesBtn').addEventListener('click', () => {
    restoreSession(_savedSession);
  });
  document.getElementById('resumeNoBtn').addEventListener('click', () => {
    clearSession();
    hideResumeBanner();
    init();
  });
} else {
  init();
}
