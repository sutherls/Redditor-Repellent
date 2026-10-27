# Development roadmap

Reddit without the Redditors: preserve useful information, original humor, meaningful disagreement, and relevant criticism while reducing repetitive and disruptive behavior.

The [comprehensive targets](FILTERING_TARGETS.md) are the product brief. Work is grouped into cohesive batches to reuse settings, context collection, explanations, and tests. A listed target is not a promise that deterministic rules can reliably recognize intent.

## 1. Repetitive comments and reply chains — in progress

Combines target sections 3, 4, 9, and the repetitive-agreement parts of 6.

Available now:

- Existing media, bot, stock-phrase, copypasta, and custom-pattern filters.
- Independent Standard/Conservative sensitivity for clichés and reply chains.
- Bounded whole-comment variations for upvote reactions, internet-win reactions, enough-Reddit-for-today replies, and friends-along-the-way templates; shared template keys also support Conservative chains.
- Conservative chains recognize related axe/sword/bow and rock-and-stone memes, identical recognized reactions (including Nice, F, 69, 420, and This is the way), and identical emoji-only replies.
- Repeated image-only chains use image URL identity, including known Reddit preview variants. This detects repetition, not the image's meaning; different reaction images and embedded captions are not classified.
- Minimum chain length, protection for always-show users, and preservation of the first chain comment and useful sibling replies, subject to other enabled rules.

Remaining: further carefully bounded cliché-template variations, lyric and quote sequences, near-duplicate replies, recursive jokes, and better pun-chain evidence. Ordinary acknowledgments and useful text must not be treated as memes merely because they are short. Unknown joke/lyric chains are intentionally preserved by Conservative mode.

Reaction-image targets include meme-taking and "in front of my bath bombs" responses. Recognizing those across different uploads or captions remains planned; URL repetition alone cannot identify them reliably.

## 2. Context and off-topic derailment — in progress

Combines sections 1, 2, and 11, plus context-sensitive aspects of 7 and 8.

Collect submission topic, subreddit, and parent-reply context before adding conservative rules for unrelated political pivots, moral lectures, and imported controversies. Preserve relevant politics, ethics, allegations, criticism, and disagreement regardless of viewpoint. Missing context should favor leaving a comment visible.

Available experimentally: opt-in political pivots, with visible post/subreddit/ancestor context, late-context rechecks, and reversible explanations. Conservative (default) requires explicit pivot wording. Standard additionally recognizes a small set of whole-comment political blame/taunt templates without an introduction, using the same patterns across supported targets. English-only recognition remains narrow. Subtle derailments, richer topic matching, and moralizing remain planned. A political keyword alone is never sufficient.

## 3. Hostility and engagement bait — planned

Review milestone available: the independent [Reddit Moment score](REDDIT_MOMENT_SCORE.md), using the user's 250 synthetic examples and context pairs as calibration material. The isolated review fixture shows evidence, protections, and missed candidates; automatic collapse is not enabled. Relevance does not exempt personally hostile delivery, and familiar wording alone is insufficient to filter a comment. Calibration and independent evaluation come next.

Combines sections 5, 6, 7, 8, and bait-related parts of 9.

Use multiple observable signals and category-specific controls for formulaic provocation, empty dismissals, shame, and repetitive outrage. Profanity, negativity, disagreement, a political name, or a phrase such as "actually" is insufficient by itself. Do not claim to establish bad faith, fabricated stories, AI authorship, or hidden motives from writing style alone.

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
