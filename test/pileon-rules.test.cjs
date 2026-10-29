const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../src/text-rules.js');
const { pileonSignature: sig, similarPileon: similar, pileonDuplicates: duplicates } = globalThis.RedditorRepellentTextRules;
const original = 'This clown deserves another shiny gold participation trophy.';

test('three near repetitions retain first, including punctuation and filler variations', () => {
  const variants = [original, 'Honestly, this clown deserves another shiny gold participation trophy!', 'This clown really deserves another shiny gold participation trophy lol.'];
  assert.deepEqual(duplicates(variants.map(sig)), [1, 2]);
  assert.deepEqual(duplicates(variants.slice(0, 2).map(sig)), []);
  assert.deepEqual(duplicates([...variants, original].map(sig)), [1, 2, 3]);
});
test('bounded wording variation is recognized without merging unrelated subjects', () => {
  assert.ok(similar(sig(original), sig('This clown deserves another golden gold participation trophy.')));
  assert.ok(similar(sig(original), sig('This clown deserves yet another shiny gold participation trophy.')));
  assert.equal(similar(sig(original), sig('This player deserves another shiny gold championship trophy.')), false);
  assert.equal(similar(sig('The dog bites the man again.'), sig('The man bites the dog again.')), false);
});
test('questions, negation, explanations, numeric details and sources are ineligible', () => {
  for (const text of [original + '?', 'This clown does not deserve another shiny gold participation trophy.', 'This clown never deserves another shiny gold participation trophy.', original + ' Because effort matters.', original + ' https://example.com', 'Try connecting pin 3 to the ground terminal.', '"' + original + '"', '> ' + original, 'Thanks', 'word '.repeat(30)]) assert.equal(sig(text), null, text);
});
test('one family cannot drift transitively into a different comment', () => {
  const a = ['one','two','three','four','five','six','seven','eight'];
  const b = ['one','two','three','four','five','six','seven','nine'];
  const c = ['one','two','three','four','five','six','ten','nine'];
  assert.ok(similar(a,b)); assert.ok(similar(b,c)); assert.equal(similar(a,c),false);
  assert.deepEqual(duplicates([a,b,c]), []);
  assert.deepEqual(duplicates([a,b,c,a]), [1,3]);
});
test('comparison cap does not prevent matching existing families', () => {
  const unique = Array.from({length:120}, (_,i) => [`subject${i}`,`verb${i}`,`object${i}`,`detail${i}`]);
  assert.deepEqual(duplicates([...unique, unique[0], unique[0]]), [120,121]);
});
