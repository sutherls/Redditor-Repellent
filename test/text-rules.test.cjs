'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');

require('../src/patterns.js');
require('../src/text-rules.js');
const { normalizeText } = globalThis.RedditorRepellentPatterns;
const { isStockPhrase, isCopypasta } = globalThis.RedditorRepellentTextRules;

test('bounded cliche variations match in both sensitivity modes', () => {
  for (const sensitivity of ['standard', 'conservative']) {
    for (const text of [
      'Angry upvote!', 'Have my angry updoot.', 'Take an upvote!',
      'You win the internet today.', 'You won the internet for today!',
      'That’s enough Reddit for today.', 'That is enough Reddit for today.',
      'The real treasure was the friends we made along the way.',
      'Maybe the real bug fixes were the friends we made along the way.',
    ]) assert.equal(isStockPhrase(normalizeText(text), sensitivity), true, `${sensitivity}: ${text}`);
  }
});

test('cliche templates preserve explanations, references, and unrelated discussion', () => {
  for (const sensitivity of ['standard', 'conservative']) {
    for (const text of [
      'Take my upvote because this explains the voltage difference.',
      'You win the internet today, but the calculation is incorrect.',
      'That is enough Reddit for today; I need to finish the repair.',
      'The real treasure was the friends we made along the way, but the route was unsafe.',
      'The phrase angry upvote is a meme.', 'Can you explain "you win the internet today"?',
      'The real problem was the battery.', 'The friends we made along the way helped us move.',
      'Imagine thinking about another solution.', 'Found the electrician who fixed it.',
    ]) assert.equal(isStockPhrase(normalizeText(text), sensitivity), false, `${sensitivity}: ${text}`);
  }
});

test('cliche variants share chain keys only within their own template', () => {
  const key = text => globalThis.RedditorRepellentTextRules.chainPattern(normalizeText(text));
  assert.equal(key('Take my upvote'), key('Have my angry updoot'));
  assert.equal(key('You win the internet'), key('You won the internet today'));
  assert.equal(key('That’s enough Reddit for today'), key('That is enough Reddit for today'));
  assert.equal(key('The real treasure was the friends we made along the way'),
    key('Maybe the real bug fixes were the friends we made along the way'));
  assert.notEqual(key('Angry upvote'), key('You win the internet'));
  assert.equal(key('Take my upvote because this explains the voltage difference'), null);
});

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

test('conservative keeps acknowledgments and broad copypasta openings', () => {
  for (const text of ['Thanks.', 'Agreed.', 'Correct.', 'This.', 'lol', 'r/AskReddit', '100%', 'In the year 2000, I moved to Boston.', 'We live in a society with limited resources.', 'Somebody once told me how to fix this.']) {
    assert.equal(isStockPhrase(normalizeText(text), 'conservative'), false, text);
    assert.equal(isCopypasta(normalizeText(text), 'conservative'), false, text);
  }
  // Thanks was already preserved in Standard; the other acknowledgments were not.
  assert.equal(isStockPhrase(normalizeText('Thanks.'), 'standard'), false);
  assert.equal(isStockPhrase(normalizeText('Agreed.'), 'standard'), true);
  assert.equal(isStockPhrase(normalizeText('Correct.'), 'standard'), true);
  assert.equal(isCopypasta(normalizeText('In the year 2000, I moved to Boston.'), 'standard'), true);
});

test('conservative still catches explicit memes and specific copypasta', () => {
  for (const text of ['TAKE MY UPVOTE!', 'Username checks out.', 'Sir, this is a Wendy’s.', 'And my axe!']) {
    assert.equal(isStockPhrase(normalizeText(text), 'conservative'), true, text);
  }
  for (const text of ['Did you ever hear the tragedy of Darth Plagueis the Wise?', 'According to all known laws of aviation, there is no way a bee should be able to fly.', 'Somebody once told me the world is gonna roll me.']) {
    assert.equal(isCopypasta(normalizeText(text), 'conservative'), true, text);
  }
});

test('conservative does not match memes embedded in a substantive sentence', () => {
  for (const text of ['Username checks out, but here is how to repair the part.', 'The joke is and my axe.', 'Someone quoted did you ever hear the tragedy of Darth Plagueis the Wise.']) {
    assert.equal(isStockPhrase(normalizeText(text), 'conservative'), false, text);
    assert.equal(isCopypasta(normalizeText(text), 'conservative'), false, text);
  }
});

test('conservative chain patterns recognize related memes and exact repetitions', () => {
  const { chainPattern } = globalThis.RedditorRepellentTextRules;
  const key = text => chainPattern(normalizeText(text));
  assert.ok(key('And my axe!'));
  assert.equal(key('And my axe!'), key('and my sword'));
  assert.equal(key('and my sword'), key('and my bow'));
  assert.equal(key('Rock and stone!'), key('For Karl!'));
  assert.equal(key('LOL!'), key('lol'));
  assert.notEqual(key('lol'), key('nice'));
  assert.notEqual(key('and my axe'), key('rock and stone'));
});

test('conservative chains reject ordinary answers and embedded meme references', () => {
  const { chainPattern } = globalThis.RedditorRepellentTextRules;
  for (const text of ['Yes', 'Thanks', 'Which cable?', 'Use the blue one.', 'Agreed', '42', 'And my axe needs sharpening.', 'Please add rock and stone', 'Well, it was a step up.']) {
    assert.equal(chainPattern(normalizeText(text)), null, text);
  }
});

test('conservative repetition includes requested number, F, and emoji chains', () => {
  const { chainPattern } = globalThis.RedditorRepellentTextRules;
  const key = text => chainPattern(normalizeText(text), text);
  for (const text of ['F', '69', '420', '😂']) assert.ok(key(text), text);
  assert.equal(key('F!'), key('f'));
  assert.equal(key(' 😂 '), key('😂'));
  assert.notEqual(key('😂'), key('👍'));
  assert.equal(key('Thanks 😂'), null);
  assert.equal(key('There are 69 items.'), null);
  assert.equal(key('42'), null);
});
