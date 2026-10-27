'use strict';
const $ = id => document.getElementById(id);
const samples = [...globalThis.RedditMomentCases];
const { score } = globalThis.RedditorMomentReview;
function options() {
  $('sample').replaceChildren(...samples.map((sample, index) => {
    const option = document.createElement('option'); option.value = index; option.textContent = sample.name; return option;
  }));
}
function list(id, items) {
  $(id).replaceChildren(...items.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
}
function evaluate() {
  const result = score({ text: $('text').value, post: $('post').value, parent: $('parent').value, relevance: $('relevance').value, repeatCount: Number($('repeats').value) });
  $('score').textContent = `${result.score} / 10`; $('meter').value = result.score;
  $('outcome').textContent = `${result.outcome.replaceAll('_', ' ')} — automatic collapse disabled`;
  $('context').textContent = `Relevance: ${result.relevance} (${result.relevanceSource}).`;
  const sample = samples[Number($('sample').value)];
  $('expected').textContent = sample.text === $('text').value && (sample.post || '') === $('post').value ? `Reference preference: ${sample.expected}.` : 'Edited example — no reference label assigned.';
  list('evidence', result.evidence.length ? result.evidence.map(e => `${e.label} (+${e.weight}): “${e.excerpt}”`) : ['No supported patterns found.']);
  list('protections', result.protections.length ? result.protections : ['No protection markers detected. Substance and intent are not established.']);
}
function select() {
  const sample = samples[Number($('sample').value)];
  $('post').value = sample.post || ''; $('parent').value = sample.parent || ''; $('text').value = sample.text;
  $('relevance').value = sample.relevance || 'unknown'; $('repeats').value = 1; evaluate();
}
function metrics() {
  const cases = globalThis.RedditMomentCases.map(sample => ({ ...sample, result: score(sample) }));
  const keeps = cases.filter(c => c.expected === 'KEEP');
  const candidates = cases.filter(c => c.expected === 'CANDIDATE');
  $('metrics').textContent = `Keep cases flagged: ${keeps.filter(c => c.result.outcome === 'REVIEW_CANDIDATE').length}/${keeps.length}. Candidate cases missed: ${candidates.filter(c => c.result.outcome !== 'REVIEW_CANDIDATE').length}/${candidates.length}. Uncertain reference cases excluded: ${cases.filter(c => c.expected === 'UNCERTAIN').length}.`;
  list('caseResults', cases.map(c => `${c.name}: ${c.result.score}/10 · ${c.result.outcome}`));
}
$('sample').addEventListener('change', select); $('evaluate').addEventListener('click', evaluate);
options(); select(); metrics();
const corpusSource = typeof globalThis.RedditMomentCorpus === 'string' ? Promise.resolve(globalThis.RedditMomentCorpus) : fetch('../../docs/REDDIT_MOMENT_EXAMPLES.txt').then(response => {
  if (!response.ok) throw new Error('Source unavailable'); return response.text();
});
corpusSource.then(text => {
  const examples = text.split('# Instructions for implementing')[0].split(/\r?\n/).filter(line => line.startsWith('- "')).map(line => line.slice(3, -1));
  examples.forEach((text, index) => samples.push({ name: `Corpus ${index + 1}: ${text.slice(0, 70)}`, text, expected: 'UNLABELLED' }));
  options(); $('corpus').textContent = `${examples.length} supplied examples loaded alongside ${globalThis.RedditMomentCases.length} labeled review cases.`;
}).catch(() => { $('corpus').textContent = 'Labeled cases ready. Serve this folder locally to load the 250-example corpus.'; });
