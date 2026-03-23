// ════════════════════════════════════════════════════════════
//  voice.js — Voice Quiz Engine
//  Uses Web Speech API (SpeechSynthesis + SpeechRecognition)
//  Depends on: app.js globals (LETTERS, questions, current,
//              selectAnswer, nextBtn, showResult)
// ════════════════════════════════════════════════════════════

const Voice = (() => {

  // ── State ──
  let voiceOn       = false;   // voice mode enabled
  let isListening   = false;
  let isSpeaking    = false;
  let recognition   = null;
  let listenTimeout = null;

  // ── DOM refs (injected after DOM ready) ──
  let statusEl, micBtn, voiceToggle, speakBtn;

  // ── Browser support check ──
  const hasTTS = 'speechSynthesis' in window;
  const hasSTT = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  // ── Setup recognition engine ──
  function initRecognition() {
    if (!hasSTT) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang          = 'en-US';
    recognition.continuous    = false;
    recognition.interimResults= false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (e) => {
      clearTimeout(listenTimeout);
      const transcripts = Array.from(e.results[0]).map(r => r.transcript.trim().toLowerCase());
      handleVoiceAnswer(transcripts);
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') {
        setStatus('🔇 No speech detected — try again', 'warn');
        setTimeout(() => listenForAnswer(), 1200);
      } else {
        setStatus(`⚠️ Mic error: ${e.error}`, 'error');
        setListening(false);
      }
    };

    recognition.onend = () => {
      setListening(false);
    };
  }

  // ── Parse spoken letter/word into option index ──
  function parseAnswer(transcripts) {
    const letterMap = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5 };
    const wordMap   = {
      'option a': 0, 'option b': 1, 'option c': 2, 'option d': 3,
      'answer a': 0, 'answer b': 1, 'answer c': 2, 'answer d': 3,
      'first': 0, 'one': 0, 'second': 1, 'two': 1,
      'third': 2, 'three': 2, 'fourth': 3, 'four': 3,
      'skip': -1, 'next': -2, 'pass': -1
    };

    for (const text of transcripts) {
      const t = text.replace(/[^a-z0-9 ]/g, '').trim();

      // exact word map
      if (wordMap[t] !== undefined) return wordMap[t];

      // single letter
      if (t.length === 1 && letterMap[t] !== undefined) return letterMap[t];

      // starts with letter followed by space/end e.g. "a option" or just "a"
      const firstChar = t[0];
      if (letterMap[firstChar] !== undefined && (t.length === 1 || t[1] === ' ')) {
        return letterMap[firstChar];
      }

      // check word map partial
      for (const [key, val] of Object.entries(wordMap)) {
        if (t.includes(key)) return val;
      }

      // check if answer text matches option text
      const q = questions[current];
      const entries = Object.entries(q.options);
      for (let i = 0; i < entries.length; i++) {
        const [, optText] = entries[i];
        if (optText.toLowerCase().includes(t) || t.includes(optText.toLowerCase().substring(0, 8))) {
          return i;
        }
      }
    }
    return null; // not understood
  }

  function handleVoiceAnswer(transcripts) {
    setListening(false);
    const idx = parseAnswer(transcripts);

    if (idx === null) {
      setStatus(`❓ Didn't catch that: "${transcripts[0]}" — say A, B, C or D`, 'warn');
      setTimeout(() => listenForAnswer(), 1500);
      return;
    }

    if (idx === -1) { // skip
      setStatus('⏭ Skipped', 'info');
      setTimeout(() => nextBtn.click(), 800);
      return;
    }

    if (idx === -2) { // next
      nextBtn.click();
      return;
    }

    const q = questions[current];
    const optKeys = Object.keys(q.options);
    if (idx >= optKeys.length) {
      setStatus(`❓ Option ${LETTERS[idx]} doesn't exist here`, 'warn');
      setTimeout(() => listenForAnswer(), 1200);
      return;
    }

    const key = optKeys[idx];
    setStatus(`🎤 Heard: "${transcripts[0]}" → ${key}`, 'info');

    // Trigger the answer click after a short pause so user hears feedback
    setTimeout(() => {
      selectAnswer(key);
      // After answer feedback, auto-advance to next question
      setTimeout(() => {
        if (voiceOn) nextBtn.click();
      }, 2800);
    }, 400);
  }

  // ── TTS: speak question + options ──
  function speakQuestion(onDone) {
    if (!hasTTS) { if (onDone) onDone(); return; }
    window.speechSynthesis.cancel();
    isSpeaking = true;

    const q = questions[current];
    const text = [
      `Question ${current + 1}.`,
      q.q,
      ...Object.entries(q.options).map(([key, opt]) => `${key}. ${opt}`)
    ].join('  ');

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = 'en-US';
    utter.rate  = 0.92;
    utter.pitch = 1.0;
    utter.volume = 1;

    // pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      /en[-_](US|GB|AU)/i.test(v.lang) && v.localService
    ) || voices.find(v => /en/i.test(v.lang));
    if (preferred) utter.voice = preferred;

    setStatus('🔊 Speaking question…', 'speaking');
    speakBtn.disabled = true;

    utter.onend = () => {
      isSpeaking = false;
      speakBtn.disabled = false;
      if (onDone) onDone();
    };
    utter.onerror = () => {
      isSpeaking = false;
      speakBtn.disabled = false;
      if (onDone) onDone();
    };

    window.speechSynthesis.speak(utter);
  }

  // ── STT: listen for answer ──
  function listenForAnswer() {
    if (!hasSTT || !voiceOn) return;
    if (isListening) return;
    setListening(true);
    setStatus('🎤 Listening… say A, B, C or D', 'listening');

    try {
      recognition.start();
      // Safety timeout — restart if no result after 8s
      listenTimeout = setTimeout(() => {
        if (isListening) {
          recognition.stop();
          setStatus('⏱ Timed out — listening again…', 'warn');
          setTimeout(() => listenForAnswer(), 800);
        }
      }, 8000);
    } catch (err) {
      setListening(false);
      setStatus('⚠️ Could not start mic', 'error');
    }
  }

  function stopListening() {
    clearTimeout(listenTimeout);
    if (recognition && isListening) {
      try { recognition.stop(); } catch(_) {}
    }
    setListening(false);
  }

  function stopAll() {
    window.speechSynthesis && window.speechSynthesis.cancel();
    stopListening();
    isSpeaking = false;
    setStatus('', 'idle');
  }

  // ── Trigger full voice cycle: speak then listen ──
  function runVoiceCycle() {
    if (!voiceOn) return;
    stopAll();
    speakQuestion(() => {
      if (voiceOn) listenForAnswer();
    });
  }

  // ── UI helpers ──
  function setListening(val) {
    isListening = val;
    micBtn.classList.toggle('listening', val);
    micBtn.textContent = val ? '⏹ Stop' : '🎤 Listen';
  }

  function setStatus(msg, type = 'info') {
    statusEl.textContent  = msg;
    statusEl.className    = `voice-status voice-status--${type}`;
  }

  // ── Public API ──
  function setup() {
    statusEl    = document.getElementById('voiceStatus');
    micBtn      = document.getElementById('micBtn');
    voiceToggle = document.getElementById('voiceToggle');
    speakBtn    = document.getElementById('speakBtn');

    if (!hasTTS && !hasSTT) {
      statusEl.textContent = '⚠️ Voice not supported in this browser';
      voiceToggle.disabled = true;
      micBtn.disabled = true;
      speakBtn.disabled = true;
      return;
    }

    initRecognition();

    // voices load async in Chrome
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {};
      window.speechSynthesis.getVoices();
    }

    // Toggle voice mode
    voiceToggle.addEventListener('click', () => {
      voiceOn = !voiceOn;
      voiceToggle.classList.toggle('active', voiceOn);
      voiceToggle.textContent = voiceOn ? '🎙 Voice: ON' : '🎙 Voice: OFF';
      micBtn.style.display    = voiceOn ? 'inline-flex' : 'none';
      speakBtn.style.display  = voiceOn ? 'inline-flex' : 'none';
      if (voiceOn) {
        setStatus('Voice mode on — speak your answer after the question reads out', 'info');
        runVoiceCycle();
      } else {
        stopAll();
      }
    });

    // Manual speak button
    speakBtn.addEventListener('click', () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        speakBtn.disabled = false;
        setStatus('', 'idle');
      } else {
        speakQuestion(() => { if (voiceOn) listenForAnswer(); });
      }
    });

    // Manual mic button
    micBtn.addEventListener('click', () => {
      if (isListening) {
        stopListening();
        setStatus('', 'idle');
      } else {
        listenForAnswer();
      }
    });
  }

  return { setup, runVoiceCycle, stopAll, isOn: () => voiceOn };

})();

// Boot when DOM is ready (script is deferred / at bottom)
document.addEventListener('DOMContentLoaded', () => Voice.setup());
// Also call directly in case DOM already loaded
if (document.readyState !== 'loading') Voice.setup();
