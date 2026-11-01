// Background script:
//  - keeps the toolbar icon badge in sync with the per-tab count
//  - owns the all-time tally so writes from many tabs don't race
'use strict';

const api = globalThis.browser ?? globalThis.chrome;

// Service workers load the shared literal matcher here; Firefox loads it via the manifest.
if (!globalThis.RedditorRepellentPatterns && typeof importScripts === 'function') importScripts('patterns.js');
let personalQueue = Promise.resolve();
function changePersonalRule(msg) {
  const run = personalQueue.then(async () => {
    const { personalRule, personalRules } = globalThis.RedditorRepellentPatterns;
    const stored = await api.storage.local.get({ personalRules: [] });
    let rules = personalRules(stored.personalRules);
    if (msg.action === 'add') {
      const rule = personalRule(msg.text, msg.mode);
      if (!rule) throw new Error('Enter a phrase of 1–300 characters and choose a match type.');
      const existing = rules.find(r => r.mode === rule.mode && r.normalized === rule.normalized);
      if (existing) return { rules, rule: existing, added: false };
      if (rules.length >= 100) throw new Error('The 100-rule limit is reached. Remove a saved phrase first.');
      const saved = { ...rule, id: crypto.randomUUID() };
      rules.push(saved);
      await api.storage.local.set({ personalRules: rules });
      return { rules, rule: saved, added: true };
    }
    if (msg.action !== 'remove' || typeof msg.id !== 'string') throw new Error('Invalid phrase-rule action.');
    const removed = rules.find(r => r.id === msg.id);
    rules = rules.filter(r => r.id !== msg.id);
    await api.storage.local.set({ personalRules: rules });
    return { rules, removed };
  });
  personalQueue = run.catch(() => {});
  return run;
}

let exceptionQueue = Promise.resolve();
function changeException(msg) {
  const run = exceptionQueue.then(async () => {
    const { exceptionId, commentExceptions } = globalThis.RedditorRepellentPatterns;
    const id = exceptionId(msg.id);
    if (!id || !['add', 'remove'].includes(msg.action)) throw new Error('Invalid comment exception.');
    const stored = await api.storage.local.get({ commentExceptions: [] });
    let ids = commentExceptions(stored.commentExceptions);
    if (msg.action === 'add') {
      if (ids.includes(id)) return { ids, added: false };
      if (ids.length >= 1000) throw new Error('The 1,000-comment limit is reached. Remove an exception in the popup first.');
      ids.push(id);
    } else ids = ids.filter(value => value !== id);
    await api.storage.local.set({ commentExceptions: ids });
    return { ids, added: msg.action === 'add' };
  });
  exceptionQueue = run.catch(() => {});
  return run;
}

let communityQueue = Promise.resolve();
function changeCommunity(msg) {
  const run = communityQueue.then(async () => {
    const { communityName, communityFields } = globalThis.RedditorRepellentPatterns;
    const name = communityName(msg.community);
    if (!name || !['save', 'reset'].includes(msg.action)) throw new Error('Invalid community settings action.');
    const key = `community:${name}`;
    if (msg.action === 'reset') { await api.storage.sync.remove(key); return { reset:true }; }
    const stored = await api.storage.sync.get(null);
    if (!stored[key] && Object.keys(stored).filter(k => k.startsWith('community:')).length >= 50) throw new Error('The 50-community limit is reached. Reset another community first.');
    const patch = communityFields(msg.patch);
    if (!Object.keys(patch).length) throw new Error('No filter settings to save.');
    const profile = { ...communityFields(stored[key] || msg.initial), ...patch };
    if (patch.rules) profile.rules = { ...(stored[key] || msg.initial)?.rules, ...patch.rules };
    // Independent sync keys avoid one large item and preserve writes to other communities.
    await api.storage.sync.set({ [key]:profile });
    return { profile };
  });
  communityQueue = run.catch(() => {});
  return run;
}

let tallyQueue = Promise.resolve();
function addToLifetime(delta) {
  const run = tallyQueue.then(async () => {
    const { lifetime = 0 } = await api.storage.local.get({ lifetime: 0 });
    const next = Math.max(0, (Number(lifetime) || 0) + delta);
    await api.storage.local.set({ lifetime: next });
    return next;
  });
  tallyQueue = run.catch(() => {});
  return run;
}

function setBadge(tabId, count) {
  const text = count > 0 ? String(count) : '';
  try {
    api.action.setBadgeText({ tabId, text });
    if (count > 0) {
      api.action.setBadgeBackgroundColor({ tabId, color: '#ff4500' });
      if (api.action.setBadgeTextColor) api.action.setBadgeTextColor({ tabId, color: '#ffffff' });
    }
  } catch {
    /* tab may have gone away */
  }
}

api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return;

  if (msg.type === 'rgc:community') {
    changeCommunity(msg).then(sendResponse, error => sendResponse({ error:error.message || 'Could not save community settings.' }));
    return true;
  }

  if (msg.type === 'rgc:comment-exception') {
    changeException(msg).then(sendResponse, error => sendResponse({ error: error.message || 'Could not save exception.' }));
    return true;
  }

  if (msg.type === 'rgc:personal-rule') {
    changePersonalRule(msg).then(sendResponse, error => sendResponse({ error: error.message || 'Could not save phrase.' }));
    return true;
  }

  if (msg.type === 'rgc:count') {
    const tabId = sender.tab && sender.tab.id;
    if (tabId != null) setBadge(tabId, Number(msg.count) || 0);
    return;
  }

  if (msg.type === 'rgc:tally') {
    addToLifetime(Number(msg.delta) || 0).then(
      (total) => sendResponse({ total }),
      () => sendResponse({ error: true }),
    );
    return true; // async response
  }

  if (msg.type === 'rgc:reset-lifetime') {
    tallyQueue = tallyQueue.then(() => api.storage.local.set({ lifetime: 0 })).catch(() => {});
    tallyQueue.then(() => sendResponse({ total: 0 }));
    return true;
  }
});
