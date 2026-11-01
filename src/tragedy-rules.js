/* Tragedy-context joke templates and generic humor defenses; no inference of intent. */
(() => {
  'use strict';
  const normalize = value => String(value || '').toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
  const event = /\b(?:fatal(?:ities)?|killed|people (?:died|dying)|\d+ (?:people )?(?:dead|died)|death toll|loss of life|passed away|(?:plane|aircraft|jet|helicopter|train) crash(?:es|ed)?|mass shooting|terrorist attack|deadly (?:crash|fire|attack)|victims? (?:died|of the (?:crash|attack|fire)))\b/;
  const fictional = /\b(?:futurama|simpsons|south park|video game|flight sim(?:ulator)?|fictional|movie scene|film scene|tv episode|season finale)\b/;
  const personal = /\b(?:my (?:father|mother|dad|mom|mum|son|daughter|child|wife|husband|partner|friend|brother|sister|grandfather|grandmother) (?:passed away|died|was killed)|i (?:lost|survived|witnessed)|(?:im|i am|as) (?:an? )?(?:paramedic|first responder|firefighter|survivor)|helped me (?:cope|grieve)|my (?:grief|trauma|therapist))\b/;
  const jokes = [
    /^(?:well[, ]+)?to shreds[,]? you say[?.!]*(?: (?:and|how about) (?:his|her|their) wife[?.!]*)?$/,
    /^(?:(?:sir|mate|buddy)[, ]+)?(?:you )?(?:cant|cannot) (?:park|land) (?:there|here)[.!]*$/,
    /^(?:didnt even stop to inform you )?(?:you )?cant land (?:here|there)[.!]*$/,
    /^(?:the )?(?:camera ?man|cam guy) never dies[.!]*$/,
    /^(?:obviously )?(?:still )?(?:the )?(?:cam guy|camera ?man|cyclists?|bikes?)s? fault(?: somehow)?[.!]*$/,
    /^(?:definitely )?not driving defensively enough[.!]*(?: always be scanning the sky[, ]*(?:people)?[.!]*)?$/,
    /^this is why i slow down by \d+\s*\/?(?:km|mph) near (?:any )?potential plane crash site i drive by[.!]*$/,
    /^(?:the )?(?:business )?(?:jet|plane) (?:got|was) cut off by (?:an? )?(?:nissan|altima|bmw)[.!]*$/,
    /^its always an? (?:altima|nissan|bmw)[.!]*$/,
    /^we need to see what happened before the video[, .]+(?:the )?cam guy may have been antagonizing the (?:jet|plane)[.!]*$/,
  ];
  function classify(value, sensitivity = 'standard') {
    const raw = String(value || '').trim(), text = normalize(raw);
    if (!text || raw.length > 600 || text.split(' ').length > 90 || /https?:|[>"“”]/i.test(raw) || personal.test(text)) return null;
    if (jokes.some(pattern => pattern.test(text))) return 'Recurring disaster/death joke template';
    if (sensitivity === 'conservative') return null;
    // Preserve objections to the excuse rather than counting mentions as endorsement.
    if (/\b(?:not coping|arent coping|isnt coping|none of|stop (?:using|pretending)|not an excuse|doesnt excuse|does not excuse|tasteless|insensitive)\b/.test(text)) return null;
    const humor = /\b(?:humou?r|jokes?|joking|laugh(?:ing|ter)?)\b/.test(text);
    const coping = /\b(?:cope|coping|grief|trauma|griev(?:e|ing))\b/.test(text);
    const general = /\b(?:some people|people (?:cope|handle|deal|use|process)|everyone (?:copes|grieves)|coping (?:method|mechanism)|way (?:of|to) coping|how (?:people|some people) cope)\b/.test(text);
    if (humor && coping && general) return 'Generic humor-as-coping defense';
    if (/\b(?:childish|moral high ground|arbiter|silly)\b/.test(text) && /\b(?:coping method|coping mechanism|reactions to (?:things|tragedy|death))\b/.test(text)) return 'Dismissive defense of tragedy reactions';
    if (/^being grim and serious doesnt improve the outcome[.!]/.test(text) && /\b(?:die|death)\b/.test(text) && /\bdark humou?r\b/.test(text)) return 'Stock dark-humor defense';
    return null;
  }
  function match(value, context, sensitivity = 'standard') {
    const reason = classify(value, sensitivity);
    if (!reason || !context || fictional.test(normalize(context.title))) return null;
    const surrounding = [context.title, ...(context.ancestors || [])].map(normalize);
    return surrounding.some(text => event.test(text)) ? reason : null;
  }
  globalThis.RedditorRepellentTragedy = { classify, match };
})();
