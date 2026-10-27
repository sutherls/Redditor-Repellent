/* Review-only heuristic. Not loaded by the extension. No network or storage. */
(() => {
  'use strict';
  const rules = [
    { id: 'template', label: 'Familiar rhetorical template', weight: 1, patterns: [/\bimagine (?:still |defending |thinking |being |paying |prioritizing )[^.!?\n]{0,90}/i, /\btell me you .{1,80} without telling me\b/i, /\bfound the\b/i, /\b(?:let that sink in|end of discussion|some of us actually)\b/i] },
    { id: 'attack', label: 'Personal or group insult', weight: 3, patterns: [/\b(?:you(?:re| are)|anyone .{0,65} is|people .{0,65} are) (?:a |an )?(?:bootlicker|idiot|moron|shill|brainwashed)\b/i, /\b(?:found the|that|you|a bunch of|cult of) (?:corporate )?(?:bootlicker|idiots?|morons?|shill|creep)\b/i, /\b(?:bootlickers|idiots|morons) (?:defending|supporting)\b/i] },
    { id: 'moral', label: 'Moral pressure or superiority claim', weight: 3, patterns: [/\b(?:some of us|i) (?:actually )?(?:have morals|have empathy|have a conscience|prefer not funding evil)\b/i, /\bif you (?:still )?(?:support|buy|enjoy).{1,80}(?:youre|you are) part of the problem\b/i, /\banyone (?:defending|supporting) .{1,60} should be ashamed\b/i] },
    { id: 'dismissal', label: 'Dismissal of disagreement', weight: 2, patterns: [/\bno (?:reasonable|decent) person (?:could|can) (?:possibly )?disagree\b/i, /\bthere are no good arguments against\b/i, /\b(?:end of discussion|i shouldnt have to educate you|i cant help you)\b/i] },
  ];
  function score(input = {}) {
    const raw = String(input.text || '').slice(0, 12000);
    const text = raw.replace(/[’']/g, '');
    const evidence = [];
    const used = [];
    for (const rule of [...rules].sort((a, b) => b.weight - a.weight)) {
      // One contribution per family; overlapping text cannot supply two signals.
      for (const pattern of rule.patterns) {
        const match = pattern.exec(text);
        if (!match || used.some(([a, b]) => match.index < b && match.index + match[0].length > a)) continue;
        evidence.push({ id: rule.id, label: rule.label, weight: rule.weight, excerpt: match[0] });
        used.push([match.index, match.index + match[0].length]);
        break;
      }
    }
    if (Number.isInteger(input.repeatCount) && input.repeatCount >= 3) {
      evidence.push({ id: 'repetition', label: 'Reviewer-confirmed identical repetition', weight: 2, excerpt: `${input.repeatCount} occurrences supplied by reviewer` });
    }
    const protections = [];
    if (!String(input.post || '').trim() && !String(input.parent || '').trim()) protections.push('Missing post and parent context');
    if (/^\s*>/m.test(raw) || /[“”"]/.test(raw)) protections.push('Quoted material needs human review');
    if (/\b(?:because|therefore|for example|measured|tested)\b/i.test(raw) && /\b\d+(?:\.\d+)?\s*(?:%|ms|volts?|watts?|hours?|dollars?|degrees?)\b/i.test(raw)) protections.push('Concrete explanation marker; review possible substance');
    if (/https?:\/\//i.test(raw)) protections.push('Linked evidence needs human review');
    if (String(input.text || '').length > 12000) protections.push('Input exceeds review limit');
    const value = Math.min(10, evidence.reduce((sum, item) => sum + item.weight, 0));
    const substantiveFamilies = evidence.filter(item => item.id !== 'template').length;
    const candidate = value >= 5 && substantiveFamilies >= 2 && protections.length === 0;
    return {
      score: value, evidence, protections,
      outcome: candidate ? 'REVIEW_CANDIDATE' : evidence.length || protections.length ? 'UNCERTAIN' : 'NO_MATCH',
      relevance: ['relevant', 'off-topic'].includes(input.relevance) ? input.relevance : 'unknown',
      relevanceSource: ['relevant', 'off-topic'].includes(input.relevance) ? 'reviewer annotation' : 'not inferred',
      autoCollapse: false,
    };
  }
  globalThis.RedditorMomentReview = { score };
})();
