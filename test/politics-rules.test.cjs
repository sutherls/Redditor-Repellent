const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../src/politics-rules.js');
const { shouldCollapse } = globalThis.RedditorRepellentPolitics;
const hobby = { title: 'Show us your new keyboard', subreddit: 'MechanicalKeyboards', postText: 'My latest build.', ancestors: [], complete: true };
test('Standard adds bounded templates symmetrically; Conservative does not', () => {
  for (const target of ['Trump', 'Biden', 'Democrats', 'Republicans', 'liberals', 'conservatives', 'capitalism', 'socialism']) {
    for (const text of [`This is what happens when you vote for ${target}!`, `${target} ruined everything.`]) {
      assert.equal(shouldCollapse(text, hobby, 'standard'), true, text);
      assert.equal(shouldCollapse(text, hobby, 'conservative'), false, text);
      assert.equal(shouldCollapse(text, { ...hobby, ancestors: ['How did the election affect prices?'] }, 'standard'), false, text);
    }
  }
  for (const text of ["This is Trump's fault.", "That is Biden’s fault!", 'This is all the Republicans fault.']) assert.equal(shouldCollapse(text, hobby, 'standard'), true, text);
});
test('Standard preserves elaboration, quoted references, missing context and unrelated criticism', () => {
  for (const text of ['Biden is awful.', 'Trump is awful.', 'Republicans ruined everything because the import regulation closed the factory.', 'This is what happens when you vote for Democrats: the policy changed.', 'The joke was that liberals ruined everything.', 'My keyboard ruined everything.', '"Conservatives ruined everything."']) {
    assert.equal(shouldCollapse(text, hobby, 'standard'), false, text);
  }
  for (const patch of [{ complete: false }, { title: '' }, { subreddit: 'Conservative' }, { subreddit: 'Liberal' }, { postText: 'A dispute over workers rights.' }]) {
    assert.equal(shouldCollapse('Democrats ruined everything.', { ...hobby, ...patch }, 'standard'), false);
  }
  assert.equal(shouldCollapse('Democrats ruined everything.', hobby, 'invalid'), false);
});
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
