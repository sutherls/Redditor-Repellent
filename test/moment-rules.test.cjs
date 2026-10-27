const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../src/moment-rules.js');
const { classify } = globalThis.RedditorRepellentMoments;
test('competence attacks combined with dismissive instructions match variations', () => {
  for (const text of ['Do you actually think before you type? I’m begging you to open a book.', 'You clearly cannot read. Educate yourself.', 'Reading comprehension is apparently optional these days. Go do your research.', 'Your critical thinking is not your strong suit. End of discussion.']) {
    const result = classify(text); assert.ok(result, text);
    assert.ok(result.signals.some(s => s.id === 'competence-attack'));
    assert.equal(classify(text, 'conservative'), null, text);
  }
});
test('questions, constructive corrections, self-description and single signals stay visible', () => {
  for (const text of ['Did you read the article?', 'Please read the second paragraph; it explains the exception.', 'Try opening a book on electronics to learn the basics.', 'I struggle with reading comprehension.', 'Do you think before you type?', 'Reading comprehension is apparently optional these days.', 'Educate yourself.', 'You clearly cannot read the faded label; try a brighter light.', 'I do my research before I buy a replacement.']) assert.equal(classify(text), null, text);
  assert.equal(classify('"You clearly cannot read. Educate yourself."'), null);
  assert.equal(classify('You clearly cannot read the faded label. Open a book with a clearer schematic.'), null);
  assert.equal(classify('You clearly cannot read. Educate yourself. For example, the 12 volts were measured at the input.'), null);
});
test('sarcastic influence framing matches but ordinary influence criticism stays', () => {
  const text = 'It’s crazy, it’s like he’s not bought and paid for. Amazing the things you can accomplish when you’re not hemmed in by special interest groups or dare I say another country….';
  assert.ok(classify(text));
  assert.equal(classify(text, 'conservative'), null);
  for (const text of ['He is not bought and paid for.', 'It is crazy how much the repair costs.', 'Special interest groups donated to the campaign.', 'Amazing what you can accomplish with practice.']) assert.equal(classify(text), null, text);
});
test('rhetorical disbelief requires accompanying GIF and ignores identity or party', () => {
  for (const text of ['Republicans lied? About a successful brown person?', 'Democrats lied? About a successful white person?', 'Republicans lied? *About a successful brown person?*']) {
    assert.ok(classify(text, 'standard', { hasGif: true }));
    assert.equal(classify(text), null);
    assert.equal(classify(text, 'conservative', { hasGif: true }), null);
  }
  for (const text of ['Did Republicans lie about the figures?', 'A successful brown person.', 'Democrats lied about the figures in the report.', 'Republicans lied? About the budget? Here is what the report says.']) assert.equal(classify(text, 'standard', { hasGif: true }), null, text);
});
test('original user-supplied Sweeney comment is matched by combined wording', () => {
  const text = `When people like tim say they want politics out of, well, anything, they just mean the politics that challenge their world view.
A billionaire is complaining that people who don't like the wealth extraction machine that helps make him richer are making a political statement and that it just isn't fair
The irony of course is that this is a political statement by Timmy. But he thinks his politics are more important bc he has money and controls some levers of capital`;
  const result = classify(text);
  assert.ok(result);
  assert.deepEqual(result.signals.map(s => s.id), ['motives', 'ideological-frame']);
});
test('mocking blame works symmetrically and Conservative requires more evidence', () => {
  for (const text of ['Well, maybe if Donnie Diapers wasn’t running the country...', 'Well, maybe if Sleepy Joe wasn’t running the country...', 'Another day, another franchise destroyed by the woke mind virus.']) {
    assert.ok(classify(text), text);
  }
  assert.equal(classify('Well, maybe if Donnie Diapers wasn’t running the country...', 'conservative'), null);
});
test('combinations cover personal attacks, moral pressure and ideological motive framing', () => {
  for (const text of ['Found the corporate shill.', 'Capitalism is a disease and anyone defending this is a bootlicker.', 'Imagine still liking anything made by that creep. Some of us actually have morals.', 'Imagine still eating fast food knowing how these corporations exploit their employees. Couldn’t be me.', 'When people like tim say they want politics out of anything, they just mean politics that challenge their world view. A billionaire complains about the wealth extraction machine. He thinks his politics are more important bc he has money and controls some levers of capital.']) assert.ok(classify(text), text);
});
test('opinions, policy explanations and ordinary criticism stay visible', () => {
  for (const text of ['Trump’s tariffs could raise consumer prices because importers may pass costs on to customers.', 'I favor higher capital gains taxes because preferential taxation contributes to inequality.', 'I usually avoid that chain because of its labor practices, but understand why people like the food.', 'I think $80 is excessive if the game offers no more content.', 'The allegations are relevant to whether the studio should work with the director.', 'Your cat has entered its expensive-hobbies era.', 'Imagine using a different cable.', 'Some of us actually have empathy.', 'Capitalism', 'Socialism', 'Donnie Diapers', 'Sleepy Joe']) assert.equal(classify(text), null, text);
});
test('quotes, sources, concrete explanation and repetition do not amplify matches', () => {
  assert.equal(classify('"Found the corporate shill."'), null);
  assert.equal(classify('> Found the corporate shill.'), null);
  assert.equal(classify('Found the corporate shill. https://example.com'), null);
  assert.equal(classify('Found the corporate shill. I tested 12 units because the specification changed.'), null);
  assert.equal(classify('Bootlicker. '.repeat(20)), null);
  assert.equal(classify('Imagine defending a position.'), null);
});
