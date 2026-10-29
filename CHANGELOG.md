# Changelog

Development milestones for Redditor Repellent. The manifest remains at the inherited version **1.2.1**; these entries are not separately published store releases.

## Unreleased

### Filtering

- Added independent opt-in repetitive pile-on filtering: three or more closely worded short comments in one top-level branch retain the first eligible comment and collapse repetitions. Supports sibling and nested replies, explanation/reveal, always-show users, live settings, and updates after edits/removals. Replies stay visible in Hide mode. Matching is local, bounded, and skips common evidence/question/negation markers.
- Expanded Reddit Moment combinations for consumer shaming: contempt about purchases paired with shaming or moral superiority. Standard and Conservative thresholds, source/quotation safeguards, explanations, and reveal behavior remain in place.
- Aggressive political-noise filtering: independent opt-in political wording detection on either side, regardless of context or accuracy. Collapses whole reply branches with matched-term explanations and reveal controls. (`4498cdb`)
- Actual Reddit Moment filtering: Standard/Conservative sensitivity for combined rhetorical patterns, with reasons, live settings, and preserved replies. The historical review lab is not required. (`d4cdba3`)
- Sarcastic influence framing, rhetorical questions with GIFs, and condescending dismissals. (`8f7ad09`, `a09e4a2`)
- Political pivots with post, subreddit, and ancestor-context safeguards; Standard adds bounded blame/taunt templates. (`f07d3c1`, `a081cb0`)
- Conservative meme/reaction/emoji chains and repeated image URL recognition, including Reddit preview variants. (`85d8492`, `d9f3d1e`)
- Independent cliché sensitivity and bounded whole-comment cliché variations. (`7a6069d`, `3434c2a`)

### Reliability and interface

- Missing optional modules no longer stop existing filters; the popup reports recovery instructions. (`7667a1c`)
- Old Reddit collapse/reveal prevents JavaScript URL navigation without weakening CSP; native-state fallback and RES behavior have regression coverage. (`55d09bf`)
- Live settings updates, late/replaced body rechecks, prior-collapse labels, and summary restoration. (`cc53cfb`, `dfd8607`)
- Reload extension button saves pending settings first. (`cc53cfb`)
- Rebranded interface, documentation, packaging, and spray-can icon; preserved upstream credit and MIT license. (`cb78ffe`)

### Documentation and limitations

- Added filtering targets, synthetic examples, and this changelog; README now compares the three political/rhetorical filtering modes.
- Filtering is deterministic and local, with no AI integration or extra permissions. English-language rules can miss comments or overmatch.
- Aggressive political noise intentionally overrides relevance and folds entire branches. Always-show users are exempt individually, but their replies can sit inside a collapsed parent.
- Local fixture checks validate behavior; they are not classification-accuracy measurements across Reddit.

## Upstream foundation

Forked from [Not This. by Chris Hoyt](https://github.com/recruiterguy/not-this). Original copyright, MIT license, and Git history are preserved.
