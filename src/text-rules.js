/*
 * Redditor Repellent — deterministic stock-phrase and copypasta matching.
 * Inputs are normalized by RedditorRepellentPatterns.normalizeText before matching.
 */
(() => {
  'use strict';

  // Stock reaction phrases. Compared after normalizeText(), so no punctuation/case.
  const PHRASES = new Set([
    'this', 'this so much', 'so much this', 'this right here', 'this is it', 'this is the answer',
    'this is the way', 'this guy gets it', 'this person gets it', 'this one', 'exactly this',
    'came here to say this', 'came here for this', 'came here to say exactly this',
    'underrated comment', 'underrated', 'take my upvote', 'have my upvote', 'upvoted',
    'take my angry upvote', 'have an upvote', 'take my updoot', 'updoot',
    'f', 'press f', 'press f to pay respects', 'rip', 'oof', 'big oof', 'oof size large', 'yikes',
    'same', 'mood', 'big mood', 'big if true', 'this aged well', 'this didnt age well',
    'username checks out', 'whoosh', 'woosh', 'thanks i hate it', 'thanks i hate this',
    'nice', 'noice', 'based', 'cringe', 'cope', 'seethe', 'ratio', 'l', 'w', 'skill issue',
    'first', 'sir this is a wendys', 'this is a wendys', 'ok boomer', 'k', 'and my axe',
    'and my sword', 'and my bow', 'you have my sword', 'and you have my sword', 'and my bow and my axe',
    'rock and stone', 'rock and stone brother', 'rock and stone to the bone', 'did i hear a rock and stone',
    'for karl', 'for carl', 'for rock and stone',
    'i understand that reference', 'wholesome', 'bruh', 'facts', 'fax', 'big facts', 'truth',
    'true', 'exactly', '+1', 'agreed', 'agree', 'correct', 'yep', 'yup', 'this 100%', '100%',
    '1000%', 'im in this picture and i dont like it', 'thats the joke', 'delete this', 'no u',
    'no you', 'noted', 'saved', 'commenting so i can find this later', 'wow', 'wtf', 'huh', 'wat',
    'cool', 'neat', 'dope', 'sick', 'lit', 'epic', 'poggers', 'pog', 'pogchamp', 'gg', 'ez',
    'nice one', 'good one', 'good bot', 'bad bot', 'lies', 'thanks for the gold kind stranger',
    'edit thanks for the gold', 'wow this blew up', 'rip my inbox', 'hello there', 'general kenobi',
    'i see youre a man of culture as well', 'a man of culture', 'the real lpt is always in the comments',
    'this needs more upvotes', 'why isnt this higher', 'this should be higher', 'this needs to be higher',
    'top comment', 'best comment', 'comment of the year', 'winner', 'we have a winner',
    'i came here to say this', 'beat me to it', 'you beat me to it', 'you win', 'you win the internet',
    'take my money', 'shut up and take my money', 'lol same', 'lmao same', 'literally me',
    'me irl', 'me af', 'relatable', 'accurate', 'nailed it', 'this guy', 'this dude', 'legend',
    'absolute legend', 'chad', 'gigachad', 'king', 'queen', 'slay', 'yas', 'yass', 'sus', 'amogus',
    'lolwut', 'wut', 'nope', 'nah', 'meh', 'ew', 'gross', 'ugh', 'omg', 'omfg', 'smh', 'idk',
    'ikr', 'fr', 'frfr', 'ong', 'deadass', 'no cap', 'cap', 'bet', 'word', 'mid', 'lame',
  ]);

  const PHRASE_RES = [
    /^(?:l+o+l+z*|lm+f?a+o+|ro+f+l+|(?:ha|he|hue|ja|ba|hi){2,}h?|k+e+k+|x+d+|lu+l+z*|lel)$/, // laughter
    /^(?:this|dis)(?: \^+)?$/,
    /^\/?r\/[a-z0-9_]+$/,                     // "r/whoosh" and any other bare subreddit name
    /^(?:so|such)? ?(?:true|accurate|real)$/,
    /^(?:big|absolute|literal) (?:facts|truth|mood|w|l)$/,
    /^\+\d+$/,
    /^(?:100|1000|69|420)%?$/,
    /^(?:f|rip|oof|yikes|bruh|lol|lmao)(?: in (?:the )?chat)?$/,
    /^(?:underrated|overrated) (?:comment|reply|take)$/,
    /^(?:this|it)s? (?:is )?(?:the|a) (?:way|one|answer|truth)$/,
  ];

  // Well-known copypasta, matched on how the (normalized) comment starts.
  const PASTA_OPENERS = [
    'what the fuck did you just fucking say about me', 'what the heck did you just say about me',
    'is this the krusty krab', 'did you ever hear the tragedy of darth plagueis',
    'according to all known laws of aviation', 'id just like to interject for a moment',
    'to be fair you have to have a very high iq', 'nothing personnel kid', 'my name is yoshikage kira',
    'the fitnessgram pacer test', 'i am once again asking', 'i sexually identify as',
    'ah i see youre a man of culture', 'hello this is bob', 'somebody once told me',
    'we live in a society', 'the real treasure was the friends we made along the way',
    'and then everyone stood up and clapped', 'and everybody clapped', 'this is where i first met',
    'in the year 2000', 'i cant believe youve done this', 'you know i had to do it to em',
  ];

  // Deliberately narrow: ordinary acknowledgments and subreddit references stay out.
  const CONSERVATIVE_PHRASES = new Set([
    'take my upvote', 'take my angry upvote', 'take my updoot',
    'username checks out', 'sir this is a wendys', 'this is a wendys',
    'and my axe', 'and my sword', 'and my bow', 'and my bow and my axe',
    'rock and stone', 'rock and stone brother', 'rock and stone to the bone',
    'did i hear a rock and stone', 'thanks for the gold kind stranger',
    'edit thanks for the gold', 'rip my inbox', 'general kenobi',
    'the real lpt is always in the comments', 'you win the internet',
    'shut up and take my money', 'im in this picture and i dont like it',
  ]);
  const CONSERVATIVE_PASTA_OPENERS = [
    'what the fuck did you just fucking say about me you little',
    'did you ever hear the tragedy of darth plagueis the wise',
    'according to all known laws of aviation there is no way',
    'to be fair you have to have a very high iq to understand rick and morty',
    'the fitnessgram pacer test is a multistage',
    'somebody once told me the world is gonna roll me',
  ];

  // Anchored, bounded templates only: added explanations must stay visible.
  // Shared keys let cosmetic variations form a chain without mixing meme families.
  const CLICHE_TEMPLATES = [
    ['upvote', /^(?:(?:take|have) (?:my|an?) (?:angry )?(?:upvote|updoot)|angry upvote)$/],
    ['internet-win', /^you (?:win|won) the internet(?: (?:today|for today))?$/],
    ['enough-reddit', /^(?:thats|that is) enough reddit for today$/],
    ['friends-along-the-way', /^(?:maybe )?the real [a-z]+(?: [a-z]+){0,2} (?:was|were) the friends we made along the way$/],
  ];

  function clicheTemplate(normalizedText) {
    return CLICHE_TEMPLATES.find(([, pattern]) => pattern.test(normalizedText))?.[0] || null;
  }

  function isStockPhrase(normalizedText, sensitivity = 'standard') {
    if (clicheTemplate(normalizedText)) return true;
    if (sensitivity === 'conservative') return CONSERVATIVE_PHRASES.has(normalizedText);
    return PHRASES.has(normalizedText) || PHRASE_RES.some((re) => re.test(normalizedText));
  }

  function isCopypasta(normalizedText, sensitivity = 'standard') {
    const openers = sensitivity === 'conservative' ? CONSERVATIVE_PASTA_OPENERS : PASTA_OPENERS;
    return openers.some((opener) => normalizedText.startsWith(opener));
  }

  // Whole-comment matches only. Shared keys identify related meme replies;
  // other recognized reactions must repeat the same normalized phrase.
  const CHAIN_FAMILIES = [
    ['and my axe', 'and my sword', 'and my bow', 'you have my sword', 'and you have my sword', 'and my bow and my axe'],
    ['rock and stone', 'rock and stone brother', 'rock and stone to the bone', 'did i hear a rock and stone', 'for karl', 'for carl', 'for rock and stone'],
  ];
  const REPEATED_REACTIONS = new Set(['this', 'this is the way', 'lol', 'lmao', 'nice', 'f', '69', '420']);

  function chainPattern(normalizedText, rawText = normalizedText) {
    // Match repeated emoji-only replies, never emoji embedded in real text.
    if (/\p{Extended_Pictographic}/u.test(rawText) &&
        /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Emoji_Component}|‍|️|\s)+$/u.test(rawText)) {
      return `emoji:${rawText.replace(/[\s\uFE0F]/gu, '')}`;
    }
    const family = CHAIN_FAMILIES.findIndex((phrases) => phrases.includes(normalizedText));
    if (family !== -1) return `family:${family}`;
    const template = clicheTemplate(normalizedText);
    if (template) return `template:${template}`;
    if (CONSERVATIVE_PHRASES.has(normalizedText) || REPEATED_REACTIONS.has(normalizedText)) {
      return `repeat:${normalizedText}`;
    }
    return null;
  }

  // Bounded wording similarity, not semantic agreement or author classification.
  function pileonSignature(value) {
    const raw = String(value || '').trim();
    if (raw.length > 180 || /[?？\d“”"<>]|https?:|www\.|\[[^\]]*\]\(/i.test(raw)) return null;
    const text = raw.toLowerCase().replace(/[’']/g, '').replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (/\b(?:no|not|never|dont|doesnt|didnt|isnt|arent|wasnt|werent|cant|cannot|wont|wouldnt|shouldnt|couldnt|without|neither|nor|but|however|because|since|example|instead|actually)\b/.test(text)) return null;
    const words = text.split(' ');
    if (words.length < 4 || words.length > 24) return null;
    const tokens = words.filter(w => !/^(?:the|a|an|and|just|really|literally|honestly|lol|lmao)$/.test(w));
    return new Set(tokens).size >= 4 ? tokens : null;
  }

  function similarPileon(a, b) {
    if (!a || !b || Math.abs(a.length - b.length) > 2) return false;
    if (a.length === b.length) return a.filter((word, i) => word === b[i]).length / a.length >= 0.85;
    const [short, long] = a.length < b.length ? [a, b] : [b, a];
    let i = 0;
    for (const word of long) if (word === short[i]) i++;
    return i === short.length && short.length / long.length >= 0.85;
  }

  function pileonDuplicates(signatures) {
    const groups = [];
    signatures.forEach((signature, index) => {
      if (!signature) return;
      const group = groups.find(g => similarPileon(g.signature, signature));
      if (group) group.indices.push(index);
      // Bound comparisons per comment even in very large branches.
      else if (groups.length < 100) groups.push({ signature, indices: [index] });
    });
    return groups.filter(g => g.indices.length >= 3).flatMap(g => g.indices.slice(1));
  }

  globalThis.RedditorRepellentTextRules = { isStockPhrase, isCopypasta, chainPattern, pileonSignature, similarPileon, pileonDuplicates };
})();
