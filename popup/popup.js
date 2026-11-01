'use strict';

const api = globalThis.browser ?? globalThis.chrome;

const RULE_DEFAULTS = {
  gif: true, image: false, emote: true, phrase: true, link: false,
  bot: true, pasta: true, quote: false, short: false, score: false, chain: false,
  politics: false,
  moment: false,
  politicalNoise: false,
  pileon: false,
  imageChain: false,
  tragedy: false,
};
const DEFAULTS = {
  enabled: true, mode: 'collapse', showCounter: true, keepReplies: false,
  rules: RULE_DEFAULTS, shortWords: 3, scoreBelow: 0, chainLength: 3,
  clicheSensitivity: 'standard',
  chainSensitivity: 'standard',
  politicsSensitivity: 'conservative',
  momentSensitivity: 'standard',
  tragedySensitivity: 'standard',
  mutedUsers: [], allowedUsers: [], customPatterns: '',
};
const LABELS = {
  tragedy: 'tragedy-thread cliché',
  personal: 'saved phrase',
  imageChain: 'image-chain reply',
  pileon: 'repetitive pile-on',
  gif: 'GIF', image: 'image', emote: 'emoji', phrase: '"this"', link: 'link-only',
  bot: 'bot', pasta: 'copypasta', quote: 'quote-only', short: 'short', score: 'downvoted',
  muted: 'muted', custom: 'custom pattern', chain: 'reply chain', politics: 'political pivot', moment: 'Reddit Moment', politicalNoise: 'political noise',
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
const $politicsSensitivity = $('politicsSensitivity');
const $momentSensitivity = $('momentSensitivity');
const $tragedySensitivity = $('tragedySensitivity');
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
  s.rules.link = false; // Ignore the retired bare-link preference.
  s.clicheSensitivity = s.clicheSensitivity === 'conservative' ? 'conservative' : 'standard';
  s.chainSensitivity = s.chainSensitivity === 'conservative' ? 'conservative' : 'standard';
  s.politicsSensitivity = s.politicsSensitivity === 'standard' ? 'standard' : 'conservative';
  s.momentSensitivity = s.momentSensitivity === 'conservative' ? 'conservative' : 'standard';
  s.tragedySensitivity = s.tragedySensitivity === 'conservative' ? 'conservative' : 'standard';
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
const { communityName, communityFields, communitySettings, COMMUNITY_FIELDS } = globalThis.RedditorRepellentPatterns;
let storedSettings = {}, selectedCommunity = '', tabCommunity = null, communityEdited = false;
const $scope = $('settingsScope'), $scopeStatus = $('scopeStatus'), $resetCommunity = $('resetCommunity');

function renderScope() {
  const names = new Set(Object.keys(storedSettings).filter(k => k.startsWith('community:')).map(k => communityName(k.slice(10))).filter(Boolean));
  if (tabCommunity) names.add(tabCommunity);
  if (selectedCommunity) names.add(selectedCommunity);
  $scope.replaceChildren(new Option('Global defaults', ''));
  for (const name of [...names].sort()) $scope.append(new Option(`r/${name}${name === tabCommunity ? ' (current tab)' : ''}`, name));
  $scope.value = selectedCommunity;
  const overridden = !!storedSettings[`community:${selectedCommunity}`];
  $resetCommunity.hidden = !selectedCommunity || !overridden;
  $scopeStatus.textContent = !selectedCommunity ? 'Editing global defaults. Saved community overrides remain separate.'
    : overridden ? `Editing custom filters for r/${selectedCommunity}.`
    : `r/${selectedCommunity} uses global defaults. Changing a filter here creates an override.`;
}

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
  $politicsSensitivity.value = s.politicsSensitivity;
  $momentSensitivity.value = s.momentSensitivity;
  $tragedySensitivity.value = s.tragedySensitivity;
  $clicheSensitivity.value = s.clicheSensitivity;
  $customPatterns.value = s.customPatterns;
  renderPatternErrors();
  renderPatternTest();
}

async function load() {
  storedSettings = await api.storage.sync.get(null);
  try {
    const [tab] = await api.tabs.query({active:true,currentWindow:true});
    if (tab?.id) tabCommunity = communityName((await api.tabs.sendMessage(tab.id,{type:'rgc:stats'}))?.community);
  } catch { /* Global and saved community settings are still editable. */ }
  renderScope();
  current = normalize(communitySettings(storedSettings, selectedCommunity));
  render(current);
}

let saveQueue = Promise.resolve();
function save(patch, retry = false) {
  const scope = selectedCommunity;
  const initial = communityFields(current);
  const scoped = scope ? communityFields(patch) : {};
  if (scope && scoped.rules && !retry) scoped.rules = Object.fromEntries(Object.entries(scoped.rules).filter(([key,value]) => current.rules[key] !== value));
  Object.assign(current, patch);
  const globalPatch = Object.fromEntries(Object.entries(patch).filter(([key]) => key in DEFAULTS && (!scope || !COMMUNITY_FIELDS.includes(key))));
  if (Object.keys(scoped).length) communityEdited = true;
  saveQueue = saveQueue.catch(() => {}).then(async () => {
    if (Object.keys(globalPatch).length) { await api.storage.sync.set(globalPatch); Object.assign(storedSettings,globalPatch); }
    if (Object.keys(scoped).length) {
      const response = await api.runtime.sendMessage({type:'rgc:community',action:'save',community:scope,initial,patch:scoped});
      if (!response || response.error) throw new Error(response?.error || 'Could not save community filters. Reload the extension and reopen the popup.');
      storedSettings[`community:${scope}`] = response.profile;
    }
    renderScope();
  }).catch(error => { $scopeStatus.textContent = `Settings could not be saved: ${error.message} Try the change again.`; throw error; });
  return saveQueue;
}

$scope.addEventListener('change', async () => {
  const next = $scope.value; $scope.disabled = true;
  try {
    await Promise.all([...pendingTextSaves.values()].map(flush => flush()));
    await saveQueue;
    storedSettings = await api.storage.sync.get(null);
    selectedCommunity = next; communityEdited = false;
    current = normalize(communitySettings(storedSettings, selectedCommunity));
    render(current); renderScope();
  } catch { $scope.value = selectedCommunity; }
  $scope.disabled = false;
});
$resetCommunity.addEventListener('click', async () => {
  $resetCommunity.disabled = true;
  try {
    await Promise.all([...pendingTextSaves.values()].map(flush => flush()));
    await saveQueue.catch(() => {});
    const response = await api.runtime.sendMessage({type:'rgc:community',action:'reset',community:selectedCommunity});
    if (!response || response.error) throw new Error(response?.error || 'Could not reset community filters.');
    storedSettings = await api.storage.sync.get(null); communityEdited = false;
    current = normalize(communitySettings(storedSettings,selectedCommunity)); render(current); renderScope(); statsSoon();
  } catch(error) { $scopeStatus.textContent = error.message; }
  $resetCommunity.disabled = false;
});

function statsSoon() {
  setTimeout(refreshStats, 350);
}

$tragedySensitivity.addEventListener('change', async () => {
  await save({ tragedySensitivity: $tragedySensitivity.value });
  statsSoon();
});

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

$politicsSensitivity.addEventListener('change', async () => {
  await save({ politicsSensitivity: $politicsSensitivity.value });
});
$momentSensitivity.addEventListener('change', async () => {
  await save({ momentSensitivity: $momentSensitivity.value });
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
    if (!selectedCommunity || communityEdited || storedSettings[`community:${selectedCommunity}`]) await save({ ...current }, true);
    else await saveQueue;
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
      $status.textContent = s.communityOverride ? `Paused by r/${s.community} settings.` : 'Paused on this page.';
      return;
    }
    if (s.unavailableRules?.length) {
      $status.textContent = `${s.unavailableRules.join(', ')} did not load. Other filters remain active. Reload Redditor Repellent from chrome://extensions or edge://extensions, then refresh this Reddit tab.`;
      return;
    }
    const checked = Number.isInteger(s.commentsChecked) && s.commentsChecked >= 0 ? s.commentsChecked : null;
    const activity = (checked === null ? 'Active' : `Active · ${checked} comment${checked === 1 ? '' : 's'} checked`) + (s.communityOverride ? ` · r/${s.community} filters` : '');
    if (s.revealed) {
      $status.textContent = `${activity} · Showing ${s.revealedCount} low-effort comment${s.revealedCount === 1 ? '' : 's'} on this page (you clicked "Show them").`;
      return;
    }
    if (!s.total) {
      $status.textContent = checked === null
        ? 'Active · No matches reported. Refresh this Reddit tab to enable comment counts.'
        : checked > 0 ? `${activity} · No matches.`
        : s.isCommentThread === false ? 'Active · Open a Reddit comment thread to check comments.'
        : 'Active · Waiting for comments to load.';
      return;
    }
    const hasCollapseOnly = ['personal', 'pileon', 'imageChain', 'moment', 'politics', 'politicalNoise', 'tragedy'].some(kind => s.byKind?.[kind]);
    const verb = s.mode === 'hide' ? (hasCollapseOnly ? 'hidden or collapsed' : 'hidden') : 'collapsed';
    const parts = Object.entries(s.byKind || {})
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${n} ${LABELS[k] || k}`)
      .join(', ');
    const strong = document.createElement('strong');
    strong.textContent = String(s.total);
    $status.append(`${activity} · `, strong, ` low-effort comment${s.total === 1 ? '' : 's'} ${verb} on this page`, parts ? ` (${parts}).` : '.');
    if (s.alreadyCollapsed) $status.append(` ${s.alreadyCollapsed} were already collapsed by Reddit, RES, or you.`);
  } catch {
    $status.textContent = 'Not connected to this tab. Open a Reddit comment thread, or refresh the Reddit tab after reloading the extension.';
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

// Device-only phrase rules share the background writer with comment actions.
const $personalRules = $('personalRules'), $personalStatus = $('personalStatus'), $undoPersonal = $('undoPersonalRemove');
let removedPersonal = null;
function renderPersonalRules(value) {
  const rules = globalThis.RedditorRepellentPatterns.personalRules(value);
  $personalRules.replaceChildren();
  if (!rules.length) { $personalRules.textContent = 'No saved phrases.'; return; }
  for (const rule of rules) {
    const row = document.createElement('div'); row.className = 'personal-rule';
    const text = document.createElement('span'); text.textContent = `${rule.mode === 'exact' ? 'Whole comment' : 'Phrase anywhere'}: ${rule.text}`;
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove phrase: ${rule.text}`);
    remove.onclick = async () => {
      remove.disabled = true;
      try {
        const response = await api.runtime.sendMessage({ type:'rgc:personal-rule', action:'remove', id:rule.id });
        if (!response || response.error) throw new Error(response?.error || 'Could not remove phrase. Please retry.');
        removedPersonal = response.removed || null; $undoPersonal.hidden = !removedPersonal;
        renderPersonalRules(response.rules); $personalStatus.textContent = 'Phrase removed. Other filters still apply.';
        statsSoon();
      } catch(error) { $personalStatus.textContent = error.message; remove.disabled = false; }
    };
    row.append(text, remove); $personalRules.append(row);
  }
}
$undoPersonal.onclick = async () => {
  if (!removedPersonal) return;
  $undoPersonal.disabled = true;
  try {
    const response = await api.runtime.sendMessage({ type:'rgc:personal-rule', action:'add', text:removedPersonal.text, mode:removedPersonal.mode });
    if (!response || response.error) throw new Error(response?.error || 'Could not restore phrase. Please retry.');
    renderPersonalRules(response.rules); removedPersonal = null; $undoPersonal.hidden = true;
    $personalStatus.textContent = 'Phrase restored.'; statsSoon();
  } catch(error) { $personalStatus.textContent = error.message; }
  $undoPersonal.disabled = false;
};
api.storage.local.get({ personalRules: [] }).then(data => renderPersonalRules(data.personalRules)).catch(() => { $personalStatus.textContent = 'Could not load saved phrases. Reopen the popup to retry.'; });
api.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && 'personalRules' in changes) renderPersonalRules(changes.personalRules.newValue);
});

// Device-only comment exceptions; the background serializes writes across tabs.
function renderExceptions(value) {
  const host = $('commentExceptions'); host.replaceChildren();
  const ids = globalThis.RedditorRepellentPatterns.commentExceptions(value);
  if (!ids.length) { host.textContent = 'No comment exceptions.'; return; }
  for (const id of ids) {
    const row = document.createElement('div'); row.className = 'personal-rule';
    const label = document.createElement('span'); label.textContent = id;
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Undo exception';
    remove.setAttribute('aria-label', `Undo exception ${id}`);
    remove.onclick = async () => {
      remove.disabled = true;
      try {
        const response = await api.runtime.sendMessage({type:'rgc:comment-exception', action:'remove', id});
        if (!response || response.error) throw new Error(response?.error || 'Could not remove exception. Please retry.');
        $('exceptionStatus').textContent = 'Exception removed. Filters apply again.'; statsSoon();
      } catch (error) { $('exceptionStatus').textContent = error.message; remove.disabled = false; }
    };
    row.append(label, remove); host.append(row);
  }
}
api.storage.local.get({commentExceptions:[]}).then(data => renderExceptions(data.commentExceptions)).catch(() => { $('exceptionStatus').textContent = 'Could not load exceptions. Reopen the popup to retry.'; });
api.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && 'commentExceptions' in changes) renderExceptions(changes.commentExceptions.newValue);
});
