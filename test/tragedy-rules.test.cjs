const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../src/tragedy-rules.js');
const { match } = globalThis.RedditorRepellentTragedy;
const context = { title: 'Business jet crashes into road in fatal accident', ancestors: [] };
test('screenshot joke templates match only with visible tragedy context', () => {
  for (const text of ['To shreds, you say?', 'Obviously still the cam guy’s fault somehow', 'Definitely not driving defensively enough. Always be scanning the sky, people.', 'This is why I slow down by 10/km near any potential plane crash site I drive by!', 'the business jet got cut off by a Nissan', 'It’s always an Altima', 'We need to see what happened before the video, cam guy may have been antagonizing the jet', 'Didn’t even stop to inform you can’t land here', 'Bikes fault.', 'Sir, you can’t park there.']) {
    assert.ok(match(text, context), text);
    assert.ok(match(text, context, 'conservative'), text);
    assert.equal(match(text, { title:'A weekend bike ride', ancestors:[] }), null, text);
  }
});
test('generic coping defenses and dismissive replies match Standard only', () => {
  for (const text of ['Some people cope with tragedy and death by using humor ya know?', 'People handle trauma and grief in their own ways. Humor is a coping mechanism.', 'For real. It’s so childish to pretend you have some moral high ground over an extremely common coping method for humans.', 'Being grim and serious doesn’t improve the outcome. If I die in a similar way I hope people can find some dark humor in it.', 'And what is it to you that they do such a thing? Why does this matter to you? Are you the arbiter of appropriate reactions to things? I for one think people like you are silly.']) {
    assert.ok(match(text, context), text);assert.equal(match(text, context, 'conservative'),null,text);
  }
});
test('personal grief, objections, factual discussion and sources stay visible', () => {
  for(const text of ['I genuinely hate how many people are making jokes when people died.', 'It’s the same five jokes in every thread, it’s insufferable.', 'When my father passed away I remember people being upset with me making jokes at his funeral. People handle trauma and grief in their own ways.', 'I lost my sister. Humor helped me cope.', 'As a paramedic I use humor to cope with trauma.', 'None of y’all are coping with anything. You watch a video of people dying horribly for entertainment.', 'Using humor is not an excuse for being cruel.', 'Some people cope with humor. https://example.com/research', 'The pilot attempted to land on the road after engine failure.', '“To shreds, you say?” is an overused joke.', 'The joke about the cam guy’s fault makes no sense.']) assert.equal(match(text,context),null,text);
});
test('ancestor context works while missing, fictional and unrelated context does not',()=>{
  assert.ok(match('To shreds, you say?',{title:'Video discussion',ancestors:['I hate these jokes when people died.']}));
  for(const title of ['', 'My dead battery', 'Futurama plane crash episode', 'Flight simulator plane crash', 'Funny movie scene: plane crash'])assert.equal(match('To shreds, you say?',{title,ancestors:[]}),null,title);
  assert.equal(match('Some people cope with humor.',null),null);
});
