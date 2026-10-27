const { test } = require('node:test');
const assert = require('node:assert/strict');
require('./reddit-moment/scorer.js');
require('./reddit-moment/cases.js');
const { score } = globalThis.RedditorMomentReview;
const run = (text, patch = {}) => score({ text, post: 'Favorite keyboard?', ...patch });
test('independent signals produce a review candidate, never automatic collapse', () => {
  const result = run('You are a bootlicker. Anyone defending this should be ashamed.');
  assert.equal(result.score, 6); assert.equal(result.outcome, 'REVIEW_CANDIDATE'); assert.equal(result.autoCollapse, false);
});
test('duplicate and overlapping signals do not inflate the score', () => {
  assert.equal(run('You are an idiot. You are a moron.').score, 3);
  assert.equal(run('End of discussion.').score, 2);
  assert.notEqual(run('Imagine thinking about another solution.').outcome, 'REVIEW_CANDIDATE');
});
test('viewpoint terms do not add points or change equivalent delivery', () => {
  const texts = ['liberals', 'conservatives', 'socialists', 'capitalists', 'religious people', 'atheists'];
  for (const target of texts) {
    assert.equal(run(`I disagree with ${target}.`).score, 0);
    assert.equal(run(`You are an idiot. No reasonable person could disagree with ${target}.`).score, 5);
  }
});
test('context, quotation and concrete explanation safeguards force uncertainty', () => {
  const text = 'You are a bootlicker. Anyone defending this should be ashamed.';
  for (const patch of [{ post: '' }, { text: `"${text}"` }, { text: `${text} I tested this because it draws 12 volts.` }, { text: `${text} https://example.com` }]) {
    assert.equal(run(text, patch).outcome, 'UNCERTAIN');
  }
  assert.equal(run(text).relevance, 'unknown');
  assert.equal(run(text, { relevance: 'relevant' }).score, run(text).score);
});
test('reviewer repetition is explicit and cannot create a candidate alone', () => {
  assert.equal(run('Thanks.', { repeatCount: 3 }).score, 2);
  assert.equal(run('Thanks.', { repeatCount: 999 }).outcome, 'UNCERTAIN');
  assert.equal(run('Thanks.', { repeatCount: '3' }).score, 0);
});
test('labeled keep cases remain outside review candidates; misses are reported honestly', () => {
  for (const sample of globalThis.RedditMomentCases.filter(c => c.expected === 'KEEP')) assert.notEqual(score(sample).outcome, 'REVIEW_CANDIDATE', sample.name);
  const missed = globalThis.RedditMomentCases.filter(c => c.expected === 'CANDIDATE' && score(c).outcome !== 'REVIEW_CANDIDATE');
  console.log('Candidate misses:', missed.map(c => c.name).join('; '));
  assert.ok(missed.some(c => c.name.includes('Tim Sweeney')));
});
