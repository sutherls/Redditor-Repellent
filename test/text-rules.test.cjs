'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');

require('../src/patterns.js');
require('../src/text-rules.js');
const { normalizeText } = globalThis.NotThisPatterns;
const { isStockPhrase, isCopypasta } = globalThis.NotThisTextRules;

test('stock phrases retain case, punctuation, and whitespace normalization', () => {
  for (const text of ['This.', ' TAKE MY UPVOTE! ', 'Sir, this is a Wendy’s.', 'and my axe', '100%']) {
    assert.equal(isStockPhrase(normalizeText(text)), true, text);
  }
});

test('regex phrases still match laughter and bare subreddit references', () => {
  for (const text of ['loooool', 'hahaha', 'r/AskReddit', '/r/whoosh', '+42', 'big facts']) {
    assert.equal(isStockPhrase(normalizeText(text)), true, text);
  }
});

test('substantive sentences containing stock phrases remain unmatched', () => {
  for (const text of [
    'This is useful because it explains the measurements.',
    'I said nice because the repair solved the problem.',
    'Visit r/AskReddit for more examples.',
    'The phrase and my axe comes from that scene.',
    'Thanks for explaining how the experiment works.',
    '',
  ]) {
    assert.equal(isStockPhrase(normalizeText(text)), false, text);
    assert.equal(isCopypasta(normalizeText(text)), false, text);
  }
});

test('copypasta retains prefix matching, including existing broad matches', () => {
  for (const text of [
    'Did you ever hear the tragedy of Darth Plagueis the Wise?',
    'ACCORDING TO ALL KNOWN LAWS OF AVIATION, a bee should not fly.',
    'Somebody once told me the world was going to roll me.',
    'In the year 2000, I moved to Boston.',
  ]) {
    assert.equal(isCopypasta(normalizeText(text)), true, text);
  }
});

test('copypasta mentions away from the beginning remain unmatched', () => {
  assert.equal(isCopypasta(normalizeText('The lyric begins somebody once told me.')), false);
});

test('punctuation-only handling remains the content script responsibility', () => {
  assert.equal(isStockPhrase(normalizeText('...?!')), false);
  assert.equal(isCopypasta(normalizeText('...?!')), false);
});
