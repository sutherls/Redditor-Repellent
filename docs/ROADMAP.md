# Development roadmap

Reddit without the Redditors: preserve useful information, original humor, meaningful disagreement, and relevant criticism while reducing repetitive and disruptive behavior.

The [comprehensive targets](FILTERING_TARGETS.md) are the product brief. Work is grouped into cohesive batches to reuse settings, context collection, explanations, and tests. A listed target is not a promise that deterministic rules can reliably recognize intent.

## 1. Repetitive comments and reply chains — in progress

I develop this fork as a solo developer. My current sequence is:

1. **Repetitive pile-ons — implemented:** independent opt-in matching of closely worded short comments within one top-level branch, retaining the first eligible comment and preserving replies.
2. **Reaction-image chains — next:** detect runs of different images using reply structure. Caption reading and image meaning are outside the initial deterministic scope.
3. **Hide more like this — planned:** a comment action to save a phrase preference with undo, without implying AI learning or semantic matching. Storage and sync behavior will be documented when implemented.
4. **Per-subreddit settings — planned:** community-specific preferences with a global fallback.

I am implementing these one at a time. Existing custom patterns and same-image URL chains are separate features. See the [changelog](../CHANGELOG.md) for completed milestones.

Combines target sections 3, 4, 9, and the repetitive-agreement parts of 6.

Available now:

- Existing media, bot, stock-phrase, copypasta, and custom-pattern filters.
- Independent Standard/Conservative sensitivity for clichés and reply chains.
- Bounded whole-comment variations for upvote reactions, internet-win reactions, enough-Reddit-for-today replies, and friends-along-the-way templates; shared template keys also support Conservative chains.
- Conservative chains recognize related axe/sword/bow and rock-and-stone memes, identical recognized reactions (including Nice, F, 69, 420, and This is the way), and identical emoji-only replies.
- Repeated image-only chains use image URL identity, including known Reddit preview variants. This detects repetition, not the image's meaning; different reaction images and embedded captions are not classified.
- Minimum chain length, protection for always-show users, and preservation of the first chain comment and useful sibling replies, subject to other enabled rules.

Repetitive pile-ons are also available: three or more closely worded eligible short comments in a branch retain the first and collapse repetitions, including sibling replies. Matching skips questions, negations, numbers, sources, quotes, and media. It supports always-show users, reveal controls, live settings, and rechecks after edits or removals.

Remaining: broader paraphrase coverage beyond the implemented near-duplicate rule, further bounded cliché-template variations, lyric and quote sequences, recursive jokes, and better pun-chain evidence. Ordinary acknowledgments and useful text must not be treated as memes merely because they are short. Unknown joke/lyric chains are intentionally preserved by Conservative mode.

Reaction-image targets include meme-taking and "in front of my bath bombs" responses. Recognizing those across different uploads or captions remains planned; URL repetition alone cannot identify them reliably.

## 2. Context and off-topic derailment — in progress

Additional user-requested preference: an independent aggressive political-noise switch blocks recognized political wording regardless of context or factuality and collapses whole reply branches. This deliberately broad mode is separate from the relevance-preserving political-pivot filter and can hide useful discussion. It applies to wording on either political side without inferring an author's affiliation.

Combines sections 1, 2, and 11, plus context-sensitive aspects of 7 and 8.

Collect submission topic, subreddit, and parent-reply context before adding conservative rules for unrelated political pivots, moral lectures, and imported controversies. Preserve relevant politics, ethics, allegations, criticism, and disagreement regardless of viewpoint. Missing context should favor leaving a comment visible.

Available experimentally: opt-in political pivots, with visible post/subreddit/ancestor context, late-context rechecks, and reversible explanations. Conservative (default) requires explicit pivot wording. Standard additionally recognizes a small set of whole-comment political blame/taunt templates without an introduction, using the same patterns across supported targets. English-only recognition remains narrow. Subtle derailments, richer topic matching, and moralizing remain planned. A political keyword alone is never sufficient.

## 3. Hostility and engagement bait — in progress

The Reddit Moment filter now runs in the extension through an independent opt-in switch and Standard/Conservative sensitivity. It combines multiple rhetorical pattern families, including mocking blame, moral pressure, dismissals, and formulaic motive/ideology framing. Relevant topics do not exempt these patterns. Matched comments collapse with explanations and reveal controls. The earlier [review lab](REDDIT_MOMENT_SCORE.md) is historical development tooling, not required to use the filter. Broader coverage and false-positive refinement remain ongoing.

Combines sections 5, 6, 7, 8, and bait-related parts of 9.

Reddit Moment tuning also covers direct attacks on comprehension/intelligence paired with dismissive instructions (for example, a personal put-down followed by "educate yourself"). Standard catches these combinations; Conservative requires additional evidence. Standalone reading questions, constructive instructions, and individual weak signals are preserved by these additions.

Use multiple observable signals and category-specific controls for formulaic provocation, empty dismissals, shame, and repetitive outrage. Profanity, negativity, disagreement, a political name, or a phrase such as "actually" is insufficient by itself. Do not claim to establish bad faith, fabricated stories, AI authorship, or hidden motives from writing style alone.

Recent Reddit Moment additions cover consumer contempt combined with shaming or moral superiority, alongside sarcastic influence framing and bounded rhetorical questions accompanied by GIFs. These are wording patterns, not judgments about intent or the meaning of an image. Ordinary criticism and standalone weak signals remain outside these combinations.

## 4. Feed filtering and user feedback — planned

Combines section 10, post-level parts of 5, and feedback requirements in 11.

Extend the comment-only architecture to posts with reversible collapse and explanations. Evaluate duplicate detection and title patterns without claiming to fact-check articles or screenshots that have not been examined. Add false-positive/missed-content feedback and eventually user-defined preferences for similar content.

## Requirements across every batch

- Deterministic, fast filtering first; optional OpenAI classification later, with explicit privacy documentation.
- Minimal permissions and no silent upload of browsing content.
- Category switches and sensitivity settings, collapse explanations, and reveal controls.
- Positive and negative regression examples, old and modern Reddit coverage, and RES compatibility.
- Small Git milestones and updated documentation as behavior ships.
- Discuss new permissions, external data sharing, or significant changes to scope; routine rules and tests can be handled together within a batch.
