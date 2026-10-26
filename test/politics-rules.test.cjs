const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../src/politics-rules.js');
const { shouldCollapse } = globalThis.RedditorRepellentPolitics;
const hobby = { title: 'Show us your new keyboard', subreddit: 'MechanicalKeyboards', postText: 'My latest build.', ancestors: [], complete: true };
test('explicit political pivots use the same criteria across viewpoints', () => {
  for (const target of ['Trump', 'Biden', 'Democrats', 'Republicans', 'liberals', 'conservatives', 'capitalism', 'socialism']) {
    assert.equal(shouldCollapse(`Off topic, but ${target} is ruining everything.`, hobby), true, target);
  }
});
test('political words, criticism, and nonpolitical pivots alone do not trigger', () => {
  for (const text of ['Trump is awful.', 'Biden is awful.', 'The regulation caused this price rise.', 'Unrelated, but how do I solder this?', 'The word politics appears in the manual.', '"Off topic, but Trump is awful."', 'Off topic, but Biden is awful. https://example.com']) {
    assert.equal(shouldCollapse(text, hobby), false, text);
  }
});
test('post, ancestors and community provide preservation context', () => {
  const text = 'Unrelated, but Republicans are ruining everything.';
  for (const patch of [{ title: 'How tariffs affect keyboard prices' }, { postText: 'The manufacturer faces misconduct allegations.' }, { ancestors: ['What is the new government policy?'] }, { subreddit: 'politics' }, { subreddit: 'Conservative' }, { subreddit: 'Liberal' }, { subreddit: 'worldnews' }]) {
    assert.equal(shouldCollapse(text, { ...hobby, ...patch }), false, JSON.stringify(patch));
  }
});
test('missing context and longer or quoted discussions are preserved', () => {
  const text = 'Off topic, but Democrats are ruining everything.';
  for (const patch of [{ complete: false }, { title: '' }, { subreddit: '' }]) assert.equal(shouldCollapse(text, { ...hobby, ...patch }), false);
  assert.equal(shouldCollapse(text, null), false);
  assert.equal(shouldCollapse(text + '\nHere is an explanation.', hobby), false);
  assert.equal(shouldCollapse(text + ' detail'.repeat(61), hobby), false);
});
