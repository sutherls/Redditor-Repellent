/* Local rhetorical-pattern filtering. Signals describe wording, not intent. */
(() => {
  'use strict';
  const rules = [
    ['mockery', 3, 'Mocking label or personal insult', /\b(?:donnie diapers|sleepy joe|orange (?:clown|man)|woke mind virus|bootlickers?|corporate shills?|cult of idiots|sky daddy|godless degeneracy|(?:you(?:re| are)|that|found the) (?:an? )?(?:idiot|moron|creep|incel))\b/i],
    ['template', 1, 'Dismissive rhetorical template', /\b(?:imagine (?:still|defending|thinking|paying|prioritizing|being)|found the|tell me you .{1,70} without telling me|another day,? another|another reminder that|some of us actually|let that sink in)\b/i],
    ['blame', 2, 'Sweeping blame or taunt', /\b(?:running the country|(?:ruin\w*|destroy\w*) by|(?:ruin\w*|destroy\w*) (?:everything|this|another|a franchise)|(?:is|are) (?:a disease|a death cult|parasites)|strike[sd]? again|this is what happens|(?:line|profits?) (?:must go up|over people))\b/i],
    ['shame', 3, 'Shaming enjoyment or disagreement', /\b(?:if you (?:still )?(?:support|buy|enjoy).{1,100}(?:youre|you are) (?:automatically )?part of the problem|anyone (?:defending|supporting).{1,80}should be ashamed|imagine (?:still )?(?:liking|enjoying|paying|prioritizing|eating|defending).{1,100}|(?:you|people) .{0,50}(?:turn your conscience off|ignore anything if))\b/i],
    ['superiority', 2, 'Moral superiority claim', /\b(?:some of us (?:actually )?(?:have morals|have empathy|have a conscience|were raised to care)|couldnt be me|i prefer not funding evil|functioning moral compass|basic human decency|anyone with a conscience)\b/i],
    ['dismissal', 2, 'Dismissal of discussion', /\b(?:end of discussion|thats it thats the comment|no (?:reasonable|decent) person (?:could|can) (?:possibly )?disagree|there are no good arguments against|i shouldnt have to educate you)\b|(?:^|[.!?]\s+)(?:(?:please |go )?(?:educate yourself|open a book|learn to read|do your research)|im begging you to open a book)(?:[.!?]+(?:\s|$)|$)/i],
    ['competence-attack', 3, 'Attack on comprehension or intelligence', /\b(?:do you (?:actually |even )?think before you type|are you (?:seriously )?incapable of understanding|you (?:clearly |obviously )?(?:cant read|cannot read|lack (?:basic )?reading comprehension)|(?:your )?critical thinking (?:isnt|is not) your strong suit|reading comprehension is (?:apparently |clearly )?optional(?: these days)?)\b/i],
    ['motives', 2, 'Claims about hidden motives or beliefs', /\b(?:they just mean|he thinks his|she thinks her|they think their|only care about (?:money|profits)|wouldnt (?:piss on you|care if you)|executives are laughing at)\b/i],
    ['ideological-frame', 2, 'Formulaic ideological framing', /\b(?:wealth extraction machine|levers of capital|late stage capitalism|no ethical .{1,40} under capitalism|ideological purity test|diversity agenda|politically correct brigade)\b/i],
  ];
  const sarcasticFraming = /\b(?:its (?:crazy|almost like)|amazing (?:the things|what) you can accomplish)\b/i;
  const influenceInsinuation = /\b(?:bought and paid for|hemmed in by special interest groups|dare i say (?:another country|foreign interests))\b/i;
  const disbeliefQuestion = /^[^.!?]{1,80}\blied\?\s*(?:about|to|over) [^.!?]{1,160}\?[.!?]*$/i;
  function classify(value, sensitivity = 'standard', media = {}) {
    const raw = String(value || '').trim();
    if (!raw || raw.length > 3000 || /^\s*>/m.test(raw) || /[“”"]/.test(raw)) return null;
    const text = raw.toLowerCase().replace(/[’']/g, '').replace(/[-–—]/g, ' ').replace(/\s+/g, ' ');
    // Sources and concrete explanations get the benefit of doubt in this first version.
    if (/https?:\/\//i.test(raw) || (/\b(?:because|for example|measured|tested|data|study)\b/.test(text) && /\d/.test(text))) return null;
    const signals = rules.filter(([, , , pattern]) => pattern.test(text)).map(([id, weight, label, pattern]) => ({ id, weight, label, excerpt: text.match(pattern)[0] }));
    if (sarcasticFraming.test(text)) signals.push({ id: 'sarcastic-framing', weight: 2, label: 'Sarcastic-style framing', excerpt: text.match(sarcasticFraming)[0] });
    if (influenceInsinuation.test(text)) signals.push({ id: 'influence-insinuation', weight: 2, label: 'Hidden-influence insinuation', excerpt: text.match(influenceInsinuation)[0] });
    // Media strengthens this bounded rhetorical-question pattern only. A GIF,
    // party name, or identity reference alone does not count toward this rule.
    if (disbeliefQuestion.test(text.replace(/[*_]/g, ''))) {
      signals.push({ id: 'disbelief-question', weight: 2, label: 'Rhetorical disbelief question', excerpt: text });
      if (media.hasGif === true) signals.push({ id: 'reaction-gif', weight: 2, label: 'GIF accompanying rhetorical question', excerpt: 'GIF in this comment' });
    }
    // One contribution per family; overlapping shame/template wording is one signal.
    if (signals.some(s => s.id === 'shame')) {
      const index = signals.findIndex(s => s.id === 'template' && s.excerpt.startsWith('imagine'));
      if (index !== -1) signals.splice(index, 1);
    }
    const score = Math.min(10, signals.reduce((sum, s) => sum + s.weight, 0));
    const threshold = sensitivity === 'conservative' ? 6 : 4;
    if (signals.length < 2 || score < threshold) return null;
    return { score, signals, reason: signals.map(s => s.label).join('; ') };
  }
  // Explicitly aggressive personal topic preference: no relevance/accuracy gate.
  // Match comment wording, not an author's inferred beliefs or identity.
  const politicalNoise = /\b(?:trump(?:s)?|biden(?:s)?|obama(?:s)?|kamala(?: harris)?|maga(?:s)?|republicans?|democrats?|conservatives?|liberals?|progressives?|left[ -]wing(?:ers?)?|right[ -]wing(?:ers?)?|leftists?|marxists?|communists?|socialists?|capitalism|socialism|patriarchy|feminism|woke(?:ness)?|dei|culture[ -]war|identity politics|orange (?:jesus|man|clown)|donnie diapers|sleepy joe|pedo(?:phile)?[ -]in[ -]chief)\b/i;
  function matchPoliticalNoise(value) {
    const text = String(value || '').replace(/[’']/g, '').replace(/[–—]/g, '-');
    return text.match(politicalNoise)?.[0] || null;
  }
  globalThis.RedditorRepellentMoments = { classify, matchPoliticalNoise };
})();
