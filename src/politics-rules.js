/* Bounded political pivots. Context terms preserve comments, never block them. */
(() => {
  'use strict';
  const normalize = text => String(text || '').toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
  const political = /\b(?:trump|biden|obama|harris|democrats?|republicans?|liberals?|conservatives?|leftists?|right wingers?|left wingers?|maga|capitalism|socialism|communism|fascism|patriarchy|feminism|politics|political|ideology|ideological)\b/;
  const relevant = /\b(?:elections?|vot(?:e|es|ing|ers?)|government|president|congress|parliament|senat(?:e|or)|polic(?:y|ies)|laws?|legislation|regulat\w*|tax\w*|tariffs?|rights|courts?|war|immigration|religio\w*|ethic\w*|boycott\w*|allegations?|misconduct|discrimination|union\w*|climate|protests?|abortion|racis\w*|sexism)\b/;
  const politicalCommunity = /politic|news|conservative|liberal|democrat|republican|socialis|communis|anarch|libertarian|feminis|mensrights|econom|geopolit|worldevent|law|religio|atheis|christian|islam|judaism/;
  const pivot = /^(?:(?:this is )?off[ -]topic|(?:this is )?unrelated|this has nothing to do with [^.!?;]{1,60})[, :;-]+but\s+(.+)$/;
  const target = '(?:trump|biden|obama|harris|democrats|republicans|liberals|conservatives|leftists|capitalism|socialism|communism)';
  const templates = [
    new RegExp(`^(?:this|that) is what (?:happens|you get) when you vote for (?:the )?${target}[.!]*$`),
    new RegExp(`^(?:the )?${target} (?:ruins?|ruined|(?:is|are) ruining) everything[.!]*$`),
    new RegExp(`^(?:this|that) is (?:all )?(?:trumps|bidens|obamas|harriss|the democrats|the republicans|the liberals|the conservatives) fault[.!]*$`),
  ];
  function isCandidate(text, sensitivity = 'conservative') {
    const raw = String(text || '').trim();
    if (raw.length > 600 || /[\n>"“”]|https?:\/\//.test(raw)) return false;
    const normalized = normalize(raw);
    if (normalized.split(' ').length > 60) return false;
    const match = normalized.match(pivot);
    return (!!match && political.test(match[1])) ||
      (sensitivity === 'standard' && templates.some(pattern => pattern.test(normalized)));
  }
  function shouldCollapse(text, context, sensitivity = 'conservative') {
    if (!isCandidate(text, sensitivity) || !context?.complete || !context.title?.trim() || !context.subreddit) return false;
    if (politicalCommunity.test(normalize(context.subreddit))) return false;
    const surrounding = [context.title, context.postText, ...(context.ancestors || [])].map(normalize).join(' ');
    return !political.test(surrounding) && !relevant.test(surrounding);
  }
  globalThis.RedditorRepellentPolitics = { isCandidate, shouldCollapse };
})();
