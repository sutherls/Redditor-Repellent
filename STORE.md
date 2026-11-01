# Store listing draft

Prepared copy for a future browser-store submission. This fork has not published a store release. Chrome and Microsoft Edge are my first development targets; Firefox support is inherited from the original project.

## Name

Redditor Repellent

## Short description

Reddit without the Redditors. Customizable filters for repetitive comments, memes, bots, and low-effort reply chains.

## Full description

Reddit without the Redditors. Cut through circlejerks, tired memes, political grandstanding, and repetitive commentary to find the discussion you came for.

I develop Redditor Repellent as a solo developer. It builds on Not This. by Chris Hoyt, preserving its useful filtering and adding more control over repetitive and disruptive comments.

### Choose what gets filtered

- GIF-only replies, emoji/emotes, stock phrases, bots, and known copypasta.
- Optional static-image, quote-only, short-comment, low-score, and reply-chain filters.
- Ordinary source/wiki links stay visible unless another enabled rule matches. The former bare-link filter is retired. Recognized GIF links use the GIF filter; direct image links use the optional static-image filter. Leave that option off to target image chains without filtering individual static images.
- **Tragedy-thread clichés:** optional recurring disaster/death jokes and stock humor-as-coping defenses, requiring recognized context in the visible title or ancestor comments. Standard includes defenses; Conservative matches joke templates only. Skips recognized personal grief accounts, sources, quotes, and selected fiction contexts. Matches retain replies and explanation/reveal even in Hide mode. Detects wording, not intent; coverage is limited and mistakes are possible.
- Independent Standard/Conservative sensitivity for clichés and reply chains. Conservative chains recognize selected meme families, repeated reactions, and repeated image URLs, including supported Reddit preview variants.
- **Repetitive pile-ons:** when three or more eligible short comments use closely similar wording in one top-level branch, retain the first and collapse repetitions. Includes sibling replies. Questions, negations, numbers, sources, quotes, and media are skipped.
- **Reaction-image chains:** three or more consecutive image-only comments, including different images. Retains the first image and collapses later images individually with reveal controls. Text replies remain visible; captions and always-show users break runs. Uses image URLs and reply structure, not image meaning. Takes priority over the older reply-chain rule for image-only comments.
- **Reddit Moment:** combinations of mocking, shaming, dismissive, and formulaic rhetorical patterns, including consumer shaming. Standard and Conservative sensitivity; topic relevance alone does not exempt a match.
- **Political derailment:** limited political-pivot templates checked against visible post, subreddit, and ancestor context.
- **Political noise — aggressive:** optional political wording blocking even when relevant or factual. A matching comment folds its whole reply branch. Covers wording on either political side and can hide useful discussion.

Tragedy-thread clichés, pile-ons, reaction-image chains, Reddit Moment, political derailment, and aggressive political noise start off. Each has an independent switch.

### Make it yours

Use **Settings scope** to edit global defaults or a community's own filter settings. The first community edit saves a separate snapshot of filters, sensitivities, thresholds, pause state, and display behavior. Reset it to use the latest globals. Saved communities remain available in the selector; up to 50 profiles sync through your browser account. User lists/custom patterns stay global, while saved phrases and comment exceptions stay device-wide. Combined-community feeds use global defaults.

Correct false positives with **Always show this comment**. Device-local exceptions override all filters for the selected comment ID, including later edits, and can be undone beside the comment or in the popup. Other comments by the same author remain subject to filtering. Stores up to 1,000 IDs with no comment text or automatic reporting. In Hide mode, use Show them to access the action; collapsed parents can still conceal exempt replies.

Use **Hide more like this** beside a text comment to edit and save a phrase. Choose whole-comment matching or a phrase anywhere; case and punctuation are ignored. Saved phrases stay on this device and apply across subreddits. Undo a new save, or remove phrases with undo from the popup. Matching comments retain replies and a SAVED PHRASE reveal control even in Hide mode. This matches wording, not meaning, and does not train an AI model.

Add wildcard or regex patterns, mute usernames, or maintain an always-show list. A muted user takes precedence if also placed on the always-show list. An allowed user's reply may still sit inside a collapsed ancestor branch.

Choose collapse or hide for ordinary filters. Pile-ons, reaction-image chains, Reddit Moment, and political pivots always retain replies and use reversible collapse, even in Hide mode. Aggressive political noise always collapses the entire branch. Hover a label for its explanation and use its reveal control to inspect the comment.

A summary appears when comments match, with Show them/Hide again controls. The toolbar shows a count, and a local lifetime counter tracks automatic filtering. Settings apply live. After updating extension files, reload the extension and refresh Reddit.

The popup also shows how many currently loaded comments were checked, even when there are no matches. Waiting for comments, paused filtering, missing modules, and a disconnected tab have distinct messages. This activity count stays in page memory and is not a record of browsing history.

Works with modern and old Reddit comment layouts. Existing Reddit/user/RES collapse state is preserved during ordinary filtering; matched prior collapses can receive labels and appear in the summary. The explicit Show them action can open those matched prior collapses.

### Privacy and limitations

All classification is deterministic and runs in your browser. No AI service, analytics, tracking, or extension-initiated network requests. Preferences, including custom patterns and user lists, use browser extension sync storage and may sync through your browser account. The lifetime counter stays in local extension storage. See [the privacy policy](PRIVACY.md).

Rules can miss unwanted comments and collapse useful ones. Pile-ons detect similar wording, not equivalent meaning. Image-chain detection uses URLs and reply structure; it does not read captions or understand images. Feed/post filtering is not implemented yet. Device-only saved phrases are separate from the existing synced custom patterns; no comments are uploaded for classification.

Open source under the MIT license. Original Not This. copyright and attribution are preserved. Not affiliated with or endorsed by Reddit, Inc.

[Source and support](https://github.com/sutherls/Redditor-Repellent) · [Report an issue](https://github.com/sutherls/Redditor-Repellent/issues)

## Permission explanations

- **storage:** saves filter preferences, user lists, custom patterns, saved phrases, and a lifetime counter. General preferences and custom patterns may use browser sync; Hide more like this phrases and the counter are local.
- **Reddit host access:** reads visible comments and relevant page context to filter comments and modify their display. Content scripts are restricted to the Reddit hosts listed in the manifest.
- **Developer data collection:** none. Comment classification and comparison happen on the device; the extension does not upload browsing content.

## Single purpose

Customizable filtering of repetitive, low-effort, and unwanted comments on Reddit comment pages.

## Suggested screenshots

1. A matched thread with the summary and reveal controls visible.
2. Independent popup controls for pile-ons, Reddit Moment, and political filtering.
3. A PILE-ON explanation with the original comment and useful replies still visible.
