'use strict';

const api = globalThis.browser ?? globalThis.chrome;

const RULE_DEFAULTS = {
  gif: true, image: false, emote: true, phrase: true, link: true,
  bot: true, pasta: true, quote: false, short: false, score: false, chain: false,
  politics: false,
};
const DEFAULTS = {
  enabled: true, mode: 'collapse', showCounter: true, keepReplies: false,
  rules: RULE_DEFAULTS, shortWords: 3, scoreBelow: 0, chainLength: 3,
  clicheSensitivity: 'standard',
  chainSensitivity: 'standard',
  mutedUsers: [], allowedUsers: [], customPatterns: '',
};
const LABELS = {
  gif: 'GIF', image: 'image', emote: 'emoji', phrase: '"this"', link: 'link-only',
  bot: 'bot', pasta: 'copypasta', quote: 'quote-only', short: 'short', score: 'downvoted',
  muted: 'muted', custom: 'custom pattern', chain: 'reply chain', politics: 'political pivot',
};
// From src/patterns.js, the same matching the content script uses.
const { MAX_PATTERN_CHARS, compilePatterns, firstMatch } = globalThis.RedditorRepellentPatterns;

const $ = (id) => document.getElementById(id);
const $enabled = $('enabled');
const $body = $('body');
const $rules = [...document.querySelectorAll('input[data-rule]')];
const $modes = [...document.querySelectorAll('input[name="mode"]')];
const $shortWords = $('shortWords');
const $scoreBelow = $('scoreBelow');
const $keepReplies = $('keepReplies');
const $showCounter = $('showCounter');
const $mutedUsers = $('mutedUsers');
const $allowedUsers = $('allowedUsers');
const $chainLength = $('chainLength');
const $chainSensitivity = $('chainSensitivity');
const $clicheSensitivity = $('clicheSensitivity');
const $customPatterns = $('customPatterns');
const $patternErrors = $('patternErrors');
const $patternTest = $('patternTest');
const $patternResult = $('patternResult');
const $status = $('status');

function normalize(raw) {
  const r = raw || {};
  const s = { ...DEFAULTS, ...r };
  s.rules = { ...RULE_DEFAULTS, ...(r.rules || {}) };
  s.clicheSensitivity = s.clicheSensitivity === 'conservative' ? 'conservative' : 'standard';
  s.chainSensitivity = s.chainSensitivity === 'conservative' ? 'conservative' : 'standard';
  if ('includeImages' in r && !(r.rules && 'image' in r.rules)) s.rules.image = !!r.includeImages;
  s.mutedUsers = Array.isArray(s.mutedUsers) ? s.mutedUsers : [];
  s.allowedUsers = Array.isArray(s.allowedUsers) ? s.allowedUsers : [];
  s.customPatterns = typeof s.customPatterns === 'string' ? s.customPatterns : '';
  return s;
}

function parseUsers(text) {
  const list = text
    .split(/\r?\n/)
    .map((u) => u.trim().replace(/^\/?u\//i, ''))
    .filter(Boolean);
  return [...new Set(list.map((u) => u.toLowerCase()))];
}

function renderPatternErrors() {
  const bad = compilePatterns($customPatterns.value).errors;
  const long = $customPatterns.value.length > MAX_PATTERN_CHARS;
  const msgs = [];
  if (bad.length) msgs.push(`Line${bad.length > 1 ? 's' : ''} ${bad.join(', ')}: not a valid regex, so ${bad.length > 1 ? 'they are' : 'it is'} skipped.`);
  if (long) msgs.push(`Only the first ${MAX_PATTERN_CHARS.toLocaleString()} characters are saved.`);
  $patternErrors.textContent = msgs.join(' ');
  $patternErrors.hidden = msgs.length === 0;
}

// "Test a comment": says which of your lines, if any, would collapse it.
function renderPatternTest() {
  const text = $patternTest.value.trim();
  $patternResult.textContent = '';
  $patternResult.hidden = text === '';
  if (!text) return;
  const { tests } = compilePatterns($customPatterns.value);
  const hit = firstMatch(tests, text);
  $patternResult.classList.toggle('hit', !!hit);
  if (!tests.length) {
    $patternResult.textContent = 'Add a pattern above, then try a comment here.';
  } else if (hit) {
    const code = document.createElement('code');
    code.textContent = hit.text;
    $patternResult.append(`Collapsed by line ${hit.line}: `, code);
  } else {
    $patternResult.textContent = 'Not caught by your patterns.';
  }
}

let current = normalize({});

function render(s) {
  $enabled.checked = s.enabled;
  $body.setAttribute('aria-disabled', String(!s.enabled));
  $rules.forEach((cb) => { cb.checked = !!s.rules[cb.dataset.rule]; });
  $modes.forEach((r) => { r.checked = r.value === s.mode; });
  $shortWords.value = s.shortWords;
  $scoreBelow.value = s.scoreBelow;
  $keepReplies.checked = s.keepReplies;
  $showCounter.checked = s.showCounter;
  $mutedUsers.value = s.mutedUsers.join('\n');
  $allowedUsers.value = s.allowedUsers.join('\n');
  $chainLength.value = s.chainLength;
  $chainSensitivity.value = s.chainSensitivity;
  $clicheSensitivity.value = s.clicheSensitivity;
  $customPatterns.value = s.customPatterns;
  renderPatternErrors();
  renderPatternTest();
}

async function load() {
  const stored = await api.storage.sync.get(null);
  current = normalize(stored);
  render(current);
}

let saveQueue = Promise.resolve();
function save(patch) {
  Object.assign(current, patch);
  saveQueue = saveQueue.catch(() => {}).then(() => api.storage.sync.set(patch));
  return saveQueue;
}

function statsSoon() {
  setTimeout(refreshStats, 350);
}

$enabled.addEventListener('change', async () => {
  await save({ enabled: $enabled.checked });
  $body.setAttribute('aria-disabled', String(!$enabled.checked));
  statsSoon();
});

$rules.forEach((cb) => cb.addEventListener('change', async () => {
  const rules = { ...current.rules, [cb.dataset.rule]: cb.checked };
  await save({ rules });
  statsSoon();
}));

$modes.forEach((r) => r.addEventListener('change', async () => {
  if (r.checked) {
    await save({ mode: r.value });
    statsSoon();
  }
}));

$shortWords.addEventListener('change', async () => {
  const n = Math.min(20, Math.max(1, parseInt($shortWords.value, 10) || DEFAULTS.shortWords));
  $shortWords.value = n;
  await save({ shortWords: n });
  statsSoon();
});

$scoreBelow.addEventListener('change', async () => {
  const n = parseInt($scoreBelow.value, 10);
  const v = Number.isFinite(n) ? n : DEFAULTS.scoreBelow;
  $scoreBelow.value = v;
  await save({ scoreBelow: v });
  statsSoon();
});

$keepReplies.addEventListener('change', async () => {
  await save({ keepReplies: $keepReplies.checked });
  statsSoon();
});

$showCounter.addEventListener('change', async () => {
  await save({ showCounter: $showCounter.checked });
});

$chainLength.addEventListener('change', async () => {
  const n = Math.min(10, Math.max(3, parseInt($chainLength.value, 10) || DEFAULTS.chainLength));
  $chainLength.value = n;
  await save({ chainLength: n });
  statsSoon();
});

$clicheSensitivity.addEventListener('change', async () => {
  await save({ clicheSensitivity: $clicheSensitivity.value });
  statsSoon();
});

$chainSensitivity.addEventListener('change', async () => {
  await save({ chainSensitivity: $chainSensitivity.value });
  statsSoon();
});

// Save text boxes a moment after the last keystroke.
const pendingTextSaves = new Map();
function onTyping(el, makePatch) {
  let timer = null;
  el.addEventListener('input', () => {
    clearTimeout(timer);
    const flush = () => {
      clearTimeout(timer);
      return save(makePatch()).then(() => {
        if (pendingTextSaves.get(el) === flush) pendingTextSaves.delete(el);
      });
    };
    pendingTextSaves.set(el, flush);
    timer = setTimeout(async () => {
      await flush();
      statsSoon();
    }, 400);
  });
}

onTyping($mutedUsers, () => ({ mutedUsers: parseUsers($mutedUsers.value) }));
onTyping($allowedUsers, () => ({ allowedUsers: parseUsers($allowedUsers.value) }));
onTyping($customPatterns, () => ({ customPatterns: $customPatterns.value.slice(0, MAX_PATTERN_CHARS) }));
$customPatterns.addEventListener('input', () => {
  renderPatternErrors();
  renderPatternTest();
});
$patternTest.addEventListener('input', renderPatternTest);

$('reloadExtension').addEventListener('click', async () => {
  const button = $('reloadExtension');
  button.disabled = true;
  $('reloadStatus').textContent = 'Saving settings and reloading…';
  try {
    await Promise.all([...pendingTextSaves.values()].map((flush) => flush()));
    // Retry any earlier failed control save before closing the popup.
    await save({ ...current });
    api.runtime.reload();
  } catch {
    $('reloadStatus').textContent = 'Could not save settings or reload. Please try again.';
    button.disabled = false;
  }
});

// ---- Per-page stats ---------------------------------------------------------

async function refreshStats() {
  try {
    const [tab] = await api.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('no tab');
    const s = await api.tabs.sendMessage(tab.id, { type: 'rgc:stats' });
    if (!s) throw new Error('no response');
    $status.textContent = '';
    if (!s.enabled) {
      $status.textContent = 'Paused on this page.';
      return;
    }
    if (s.revealed) {
      $status.textContent = `Showing ${s.revealedCount} low-effort comment${s.revealedCount === 1 ? '' : 's'} on this page (you clicked "Show them").`;
      return;
    }
    if (!s.total) {
      $status.textContent = 'No low-effort comments found on this page yet.';
      return;
    }
    const verb = s.mode === 'hide' ? 'hidden' : 'collapsed';
    const parts = Object.entries(s.byKind || {})
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${n} ${LABELS[k] || k}`)
      .join(', ');
    const strong = document.createElement('strong');
    strong.textContent = String(s.total);
    $status.append(strong, ` low-effort comment${s.total === 1 ? '' : 's'} ${verb} on this page`, parts ? ` (${parts}).` : '.');
    if (s.alreadyCollapsed) $status.append(` ${s.alreadyCollapsed} were already collapsed by Reddit, RES, or you.`);
  } catch {
    $status.textContent = 'Open a Reddit comment thread to see stats.';
  }
}

// ---- All-time tally ---------------------------------------------------------

const $lifetime = $('lifetime');
const $reset = $('reset');
let resetArmed = null;

function renderLifetime(n) {
  $lifetime.textContent = '';
  const strong = document.createElement('strong');
  strong.textContent = (Number(n) || 0).toLocaleString();
  $lifetime.append('All time: ', strong, ` low-effort comment${n === 1 ? '' : 's'} hidden`);
}

async function loadLifetime() {
  try {
    const { lifetime = 0 } = await api.storage.local.get({ lifetime: 0 });
    renderLifetime(lifetime);
  } catch {
    $lifetime.textContent = '';
  }
}

api.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && 'lifetime' in changes) renderLifetime(changes.lifetime.newValue);
});

// Two-click reset: first click arms it for 4 seconds, second click resets.
$reset.addEventListener('click', async () => {
  if (!resetArmed) {
    $reset.textContent = 'Click again to reset';
    $reset.classList.add('confirm');
    resetArmed = setTimeout(() => {
      resetArmed = null;
      $reset.textContent = 'Reset';
      $reset.classList.remove('confirm');
    }, 4000);
    return;
  }
  clearTimeout(resetArmed);
  resetArmed = null;
  $reset.textContent = 'Reset';
  $reset.classList.remove('confirm');
  try {
    await api.runtime.sendMessage({ type: 'rgc:reset-lifetime' });
  } catch {
    await api.storage.local.set({ lifetime: 0 });
  }
  renderLifetime(0);
});

load().then(refreshStats);
loadLifetime();
