// ========== DATA ==========
const ENGLISH = ["the","be","to","of","and","a","in","that","have","I","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us","is","are","was","were","been","being","has","had","does","did","should","may","might","must","find","here","thing","tell","very","still","through","before","right","too","mean","same","those","own","around","under","last","never","why","while","something","place","where","again","another","every","such","each","great","much","between","both","few","more","many","little","long","high","old","young","life","hand","part","child","eye","woman","man","world","school","state","family","student","group","country","problem","fact","week","company","system","program","question","government","number","night","point","home","water","room","mother","area","money","story","month","lot","study","book","job","word","business","issue","side","kind","head","house","service","friend","father","power"];

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
];

const CODE = [
  "function fibonacci(n) { if (n <= 1) return n; return fibonacci(n - 1) + fibonacci(n - 2); }",
  "const greet = (name) => `Hello, ${name}!`;",
  "def quicksort(arr): if len(arr) <= 1: return arr; pivot = arr[len(arr) // 2]; return quicksort([x for x in arr if x < pivot]) + [x for x in arr if x == pivot] + quicksort([x for x in arr if x > pivot])",
  "async function fetchData(url) { const res = await fetch(url); return res.json(); }",
  "public static void main(String[] args) { System.out.println(\"Hello, World!\"); }",
];

const NUMBERS = ["123","456","789","1011","1213","1415","1617","1819","2021","100","200","300","400","500","600","700","800","900","1000","42","7","13","99","256","512","1024","2048","3.14","2.71","1.41"];

const THEMES = [
  { id: "serika", name: "Serika", bg: "#323437", main: "#e2b714", text: "#d1d0c5", sub: "#646669", error: "#ca4754" },
  { id: "nord", name: "Nord", bg: "#242933", main: "#88c0d0", text: "#d8dee9", sub: "#616e88", error: "#bf616a" },
  { id: "dracula", name: "Dracula", bg: "#282a36", main: "#bd93f9", text: "#f8f8f2", sub: "#6272a4", error: "#ff5555" },
  { id: "tokyo-night", name: "Tokyo Night", bg: "#1a1b26", main: "#7aa2f7", text: "#a9b1d6", sub: "#565f89", error: "#f7768e" },
  { id: "monokai", name: "Monokai", bg: "#272822", main: "#a6e22e", text: "#f8f8f2", sub: "#75715e", error: "#f92672" },
  { id: "solarized", name: "Solarized", bg: "#002b36", main: "#b58900", text: "#839496", sub: "#586e75", error: "#dc322f" },
  { id: "gruvbox", name: "Gruvbox", bg: "#282828", main: "#fabd2f", text: "#ebdbb2", sub: "#928374", error: "#fb4934" },
  { id: "catppuccin", name: "Catppuccin", bg: "#1e1e2e", main: "#cba6f7", text: "#cdd6f4", sub: "#6c7086", error: "#f38ba8" },
  { id: "olivia", name: "Olivia", bg: "#1c1b1d", main: "#deaf9d", text: "#f2efed", sub: "#4e3e3e", error: "#e32b37" },
  { id: "botanical", name: "Botanical", bg: "#1a2b1f", main: "#7cb342", text: "#e8f5e9", sub: "#558b2f", error: "#ef5350" },
];

// ========== STATE ==========
let mode = "time";
let timeLimit = 30;
let wordCount = 25;
let words = [];
let typed = "";
let started = false;
let finished = false;
let startTime = null;
let timerId = null;
let currentTheme = "serika";
let prevTypedLen = 0;

// Sound & caret settings
let soundEnabled = true;
let soundVolume = 0.4;
let caretStyle = "bar";
let caretSmooth = false;
let caretBlink = true;

// Web Audio
let audioCtx = null;

// ========== DOM ==========
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const wordsEl = $("#words");
const inputEl = $("#input");
const liveWpm = $("#live-wpm");
const liveAcc = $("#live-acc");
const liveTime = $("#live-time");
const resultsEl = $("#results");

// ========== SOUND ==========
function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playTone(freq, duration, type = "sine", volMul = 1) {
  if (!soundEnabled) return;
  try {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = soundVolume * volMul;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(soundVolume * volMul, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {}
}

function playClickSound() {
  playTone(800, 0.04, "sine", 0.6);
}

function playErrorSound() {
  playTone(220, 0.08, "square", 0.5);
}

function playFinishSound() {
  if (!soundEnabled) return;
  try {
    ensureAudio();
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
    notes.forEach((f, i) => {
      setTimeout(() => playTone(f, 0.18, "sine", 0.7), i * 90);
    });
  } catch (e) {}
}

function playTestSound() { playClickSound(); }
function playErrorSoundTest() { playErrorSound(); }
function playFinishSoundTest() { playFinishSound(); }

// expose for buttons
window.playTestSound = playTestSound;
window.playErrorSound = playErrorSound;
window.playFinishSound = playFinishSound;

// ========== HELPERS ==========
function pick(arr, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(Math.random() * arr.length)]);
  return out;
}

function generate() {
  typed = "";
  prevTypedLen = 0;
  started = false;
  finished = false;
  startTime = null;
  if (timerId) clearInterval(timerId);
  resultsEl.classList.add("hidden");
  inputEl.value = "";
  liveWpm.textContent = "0";
  liveAcc.textContent = "100";

  if (mode === "time") {
    words = pick(ENGLISH, 120);
    liveTime.textContent = timeLimit;
    $("#timer-stat").style.display = "";
  } else if (mode === "words") {
    words = pick(ENGLISH, wordCount);
    $("#timer-stat").style.display = "none";
  } else if (mode === "quote") {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    words = q.text.split(" ");
    $("#timer-stat").style.display = "none";
  } else if (mode === "code") {
    const c = CODE[Math.floor(Math.random() * CODE.length)];
    words = c.split(/\s+/).filter(Boolean);
    $("#timer-stat").style.display = "none";
  } else if (mode === "numbers") {
    words = pick(NUMBERS, 40);
    $("#timer-stat").style.display = "none";
  } else {
    words = pick(ENGLISH, 200);
    $("#timer-stat").style.display = "none";
  }
  renderWords();
  inputEl.focus();
}

function renderWords() {
  const target = words.join(" ");
  let html = "";
  let ti = 0;

  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi];
    html += `<span class="word">`;
    for (let ci = 0; ci < word.length; ci++) {
      const expected = word[ci];
      let cls = "char";
      if (ti < typed.length) {
        if (typed[ti] === expected) cls += " correct";
        else cls += " incorrect";
      }
      if (ti === typed.length) cls += " current";
      html += `<span class="${cls}">${expected}</span>`;
      ti++;
    }
    if (wi < words.length - 1) {
      let spaceCls = "char";
      if (ti < typed.length) {
        if (typed[ti] === " ") spaceCls += " correct";
        else spaceCls += " incorrect";
      }
      if (ti === typed.length) spaceCls += " current";
      html += `<span class="${spaceCls}"> </span>`;
      ti++;
    }
    html += `</span>`;
  }

  if (typed.length > target.length) {
    for (let i = target.length; i < typed.length; i++) {
      html += `<span class="char extra">${typed[i]}</span>`;
    }
  }

  wordsEl.innerHTML = html;
}

function calcStats(elapsedMs) {
  const target = words.join(" ");
  const elapsedSec = Math.max(0.001, elapsedMs / 1000);
  let correct = 0;
  const minL = Math.min(typed.length, target.length);
  for (let i = 0; i < minL; i++) {
    if (typed[i] === target[i]) correct++;
  }
  const totalTyped = typed.length || 1;
  const raw = Math.round((totalTyped / 5) / (elapsedSec / 60));
  const wpm = Math.round((correct / 5) / (elapsedSec / 60));
  const acc = Math.round((correct / totalTyped) * 100);
  return {
    wpm: Math.max(0, wpm),
    raw: Math.max(0, raw),
    acc: Math.min(100, Math.max(0, acc)),
    time: Math.round(elapsedSec * 10) / 10,
  };
}

function finish() {
  if (finished) return;
  finished = true;
  started = false;
  if (timerId) clearInterval(timerId);
  const elapsed = startTime ? Date.now() - startTime : 0;
  const s = calcStats(elapsed);
  $("#res-wpm").textContent = s.wpm;
  $("#res-acc").textContent = s.acc + "%";
  $("#res-raw").textContent = s.raw;
  $("#res-time").textContent = s.time + "s";
  resultsEl.classList.remove("hidden");
  savePB(s);
  liveWpm.textContent = s.wpm;
  liveAcc.textContent = s.acc;
  playFinishSound();
}

function onInput(e) {
  if (finished) return;
  const val = e.target.value;

  // sound on new keypress
  if (val.length > prevTypedLen) {
    const target = words.join(" ");
    const idx = val.length - 1;
    if (idx < target.length && val[idx] === target[idx]) {
      playClickSound();
    } else {
      playErrorSound();
    }
  }
  prevTypedLen = val.length;

  if (!started) {
    started = true;
    startTime = Date.now();
    if (mode === "time") {
      let left = timeLimit;
      liveTime.textContent = left;
      timerId = setInterval(() => {
        left--;
        liveTime.textContent = left;
        if (left <= 0) {
          typed = inputEl.value;
          finish();
        }
      }, 1000);
    }
  }
  typed = val;
  renderWords();

  if (startTime) {
    const s = calcStats(Date.now() - startTime);
    liveWpm.textContent = s.wpm;
    liveAcc.textContent = s.acc;
  }

  if (mode !== "time" && mode !== "zen") {
    const target = words.join(" ");
    if (typed.length >= target.length && typed.trimEnd() === target) {
      finish();
    }
  }
}

function restart() {
  generate();
}

// ========== PBs ==========
function savePB(s) {
  const key = "typehaven_pbs";
  let list = [];
  try { list = JSON.parse(localStorage.getItem(key) || "[]"); } catch {}
  const label = mode === "time" ? `time ${timeLimit}s` : mode === "words" ? `words ${wordCount}` : mode;
  list.unshift({
    mode: label,
    wpm: s.wpm,
    acc: s.acc,
    date: new Date().toLocaleDateString(),
  });
  if (list.length > 50) list = list.slice(0, 50);
  localStorage.setItem(key, JSON.stringify(list));
}

function renderPBs() {
  const key = "typehaven_pbs";
  let list = [];
  try { list = JSON.parse(localStorage.getItem(key) || "[]"); } catch {}
  const el = $("#pb-list");
  if (!list.length) {
    el.innerHTML = `<p style="color:var(--text-secondary)">No personal bests yet. Go type!</p>`;
    return;
  }
  el.innerHTML = list.map(p => `
    <div class="pb-item">
      <span class="pb-mode">${p.mode}</span>
      <span class="pb-wpm">${p.wpm} wpm</span>
      <span class="pb-acc">${p.acc}%</span>
      <span class="pb-date">${p.date}</span>
    </div>
  `).join("");
}

function clearPBs() {
  localStorage.removeItem("typehaven_pbs");
  renderPBs();
}
window.clearPBs = clearPBs;

// ========== THEMES ==========
function shade(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

function applyTheme(id) {
  const t = THEMES.find(x => x.id === id);
  if (!t) return;
  currentTheme = id;
  document.body.style.setProperty("--bg", t.bg);
  document.body.style.setProperty("--main", t.main);
  document.body.style.setProperty("--caret", t.main);
  document.body.style.setProperty("--text", t.text);
  document.body.style.setProperty("--text-secondary", t.sub);
  document.body.style.setProperty("--sub", t.sub);
  document.body.style.setProperty("--sub-alt", shade(t.bg, 10));
  document.body.style.setProperty("--error", t.error);
  document.body.style.background = t.bg;
  localStorage.setItem("typehaven_theme", id);
  renderThemeGrid();
}

function applyCustomTheme() {
  const bg = $("#c-bg").value;
  const main = $("#c-main").value;
  const text = $("#c-text").value;
  const sub = $("#c-sub").value;
  const error = $("#c-error").value;
  document.body.style.setProperty("--bg", bg);
  document.body.style.setProperty("--main", main);
  document.body.style.setProperty("--caret", main);
  document.body.style.setProperty("--text", text);
  document.body.style.setProperty("--text-secondary", sub);
  document.body.style.setProperty("--sub", sub);
  document.body.style.setProperty("--sub-alt", shade(bg, 10));
  document.body.style.setProperty("--error", error);
  document.body.style.background = bg;
  localStorage.setItem("typehaven_theme", "custom");
  localStorage.setItem("typehaven_custom", JSON.stringify({ bg, main, text, sub, error }));
}
window.applyCustomTheme = applyCustomTheme;

function renderThemeGrid() {
  const grid = $("#theme-grid");
  if (!grid) return;
  grid.innerHTML = THEMES.map(t => `
    <div class="theme-card ${currentTheme === t.id ? "active" : ""}" data-theme="${t.id}">
      <div class="theme-name">${t.name}</div>
      <div class="theme-swatches">
        <div class="swatch" style="background:${t.bg}"></div>
        <div class="swatch" style="background:${t.main}"></div>
        <div class="swatch" style="background:${t.text}"></div>
        <div class="swatch" style="background:${t.error}"></div>
      </div>
    </div>
  `).join("");
  grid.querySelectorAll(".theme-card").forEach(card => {
    card.addEventListener("click", () => applyTheme(card.dataset.theme));
  });
}

// ========== CARET & SOUND SETTINGS ==========
function applyCaretSettings() {
  document.body.classList.remove("caret-bar", "caret-block", "caret-underline", "caret-outline", "caret-off");
  document.body.classList.add(`caret-${caretStyle}`);
  document.body.classList.toggle("caret-smooth", caretSmooth);
  document.body.classList.toggle("caret-blink", caretBlink);
  localStorage.setItem("typehaven_caret", JSON.stringify({ style: caretStyle, smooth: caretSmooth, blink: caretBlink }));
}

function loadSettings() {
  // sound
  const se = localStorage.getItem("typehaven_sound");
  if (se !== null) soundEnabled = se === "1";
  const sv = localStorage.getItem("typehaven_volume");
  if (sv !== null) soundVolume = Math.min(1, Math.max(0, parseInt(sv, 10) / 100));

  const soundCb = $("#sound-enabled");
  const volRange = $("#sound-volume");
  const volVal = $("#volume-val");
  if (soundCb) soundCb.checked = soundEnabled;
  if (volRange) {
    volRange.value = Math.round(soundVolume * 100);
    if (volVal) volVal.textContent = Math.round(soundVolume * 100) + "%";
  }

  // caret
  try {
    const c = JSON.parse(localStorage.getItem("typehaven_caret") || "{}");
    if (c.style) caretStyle = c.style;
    if (typeof c.smooth === "boolean") caretSmooth = c.smooth;
    if (typeof c.blink === "boolean") caretBlink = c.blink;
  } catch {}

  $$("#caret-style-group .cfg-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.caret === caretStyle);
  });
  const smoothCb = $("#caret-smooth");
  const blinkCb = $("#caret-blink");
  if (smoothCb) smoothCb.checked = caretSmooth;
  if (blinkCb) blinkCb.checked = caretBlink;

  applyCaretSettings();
}

function bindSettings() {
  const soundCb = $("#sound-enabled");
  if (soundCb) {
    soundCb.addEventListener("change", () => {
      soundEnabled = soundCb.checked;
      localStorage.setItem("typehaven_sound", soundEnabled ? "1" : "0");
      if (soundEnabled) ensureAudio();
    });
  }
  const volRange = $("#sound-volume");
  const volVal = $("#volume-val");
  if (volRange) {
    volRange.addEventListener("input", () => {
      soundVolume = volRange.value / 100;
      if (volVal) volVal.textContent = volRange.value + "%";
      localStorage.setItem("typehaven_volume", volRange.value);
    });
  }

  $$("#caret-style-group .cfg-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$("#caret-style-group .cfg-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      caretStyle = btn.dataset.caret;
      applyCaretSettings();
    });
  });

  const smoothCb = $("#caret-smooth");
  if (smoothCb) {
    smoothCb.addEventListener("change", () => {
      caretSmooth = smoothCb.checked;
      applyCaretSettings();
    });
  }
  const blinkCb = $("#caret-blink");
  if (blinkCb) {
    blinkCb.addEventListener("change", () => {
      caretBlink = blinkCb.checked;
      applyCaretSettings();
    });
  }
}

// ========== SHARE ==========
function getShareText() {
  const wpm = $("#res-wpm").textContent;
  const acc = $("#res-acc").textContent;
  const label = mode === "time" ? `${timeLimit}s` : mode === "words" ? `${wordCount} words` : mode;
  return `I just typed ${wpm} WPM (${acc} accuracy) on TypeHaven — ${label} mode!\nTry it yourself ⌨️`;
}

$("#share-x").addEventListener("click", () => {
  const text = encodeURIComponent(getShareText());
  window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener");
});

$("#share-copy").addEventListener("click", () => {
  navigator.clipboard.writeText(getShareText()).then(() => {
    $("#share-copy").textContent = "Copied!";
    setTimeout(() => $("#share-copy").textContent = "Copy", 1500);
  });
});

$("#share-discord").addEventListener("click", () => {
  const text = "```\n" + getShareText() + "\n```";
  navigator.clipboard.writeText(text).then(() => {
    $("#share-discord").textContent = "Copied!";
    setTimeout(() => $("#share-discord").textContent = "Discord", 1500);
  });
});

// ========== NAV & CONFIG ==========
$$(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    $$(".view").forEach(v => v.classList.remove("active"));
    $(`#view-${btn.dataset.view}`).classList.add("active");
    if (btn.dataset.view === "pbs") renderPBs();
    if (btn.dataset.view === "themes") renderThemeGrid();
  });
});

$$("[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    $$("[data-mode]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;
    $("#time-options").classList.toggle("hidden", mode !== "time");
    $("#words-options").classList.toggle("hidden", mode !== "words");
    generate();
  });
});

$$("[data-time]").forEach(btn => {
  btn.addEventListener("click", () => {
    $$("[data-time]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    timeLimit = +btn.dataset.time;
    generate();
  });
});

$$("[data-words]").forEach(btn => {
  btn.addEventListener("click", () => {
    $$("[data-words]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    wordCount = +btn.dataset.words;
    generate();
  });
});

// Focus & keyboard
$("#typing-area").addEventListener("click", () => inputEl.focus());
inputEl.addEventListener("input", onInput);

document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const onEnter = (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        restart();
        document.removeEventListener("keydown", onEnter);
      }
    };
    document.addEventListener("keydown", onEnter, { once: true });
  }
});

// Init
(function init() {
  const saved = localStorage.getItem("typehaven_theme");
  if (saved === "custom") {
    try {
      const c = JSON.parse(localStorage.getItem("typehaven_custom"));
      if (c) {
        $("#c-bg").value = c.bg;
        $("#c-main").value = c.main;
        $("#c-text").value = c.text;
        $("#c-sub").value = c.sub;
        $("#c-error").value = c.error;
        applyCustomTheme();
      }
    } catch {}
  } else if (saved) {
    applyTheme(saved);
  } else {
    applyTheme("serika");
  }

  loadSettings();
  bindSettings();
  generate();
  inputEl.focus();
})();
