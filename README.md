# Redditor Repellent

**Reddit without the Redditors.**

Less circlejerking. Fewer tired memes. More of the discussion you actually came for.

Redditor Repellent is a highly customizable browser extension built to cut through repetitive comments, political grandstanding, rage bait, and terminally online commentary. Finally, you can enjoy Reddit without having to experience Reddit.

A fork of [Not This.](https://github.com/recruiterguy/not-this) by Chris Hoyt, building upon an already great extension.

## Where things stand

This project is in early development. Low-effort filters, contextual political-pivot rules, Reddit Moment pattern filtering, and optional aggressive political-noise blocking are available today. Broader contextual classification remains in development. See the [changelog](CHANGELOG.md) for completed milestones.

Chrome and Microsoft Edge are our first development targets. The inherited code supports both modern Reddit and old.reddit.com and includes Firefox support.

## What works today

### Choose your filtering level

| Setting | Purpose | Replies |
| --- | --- | --- |
| Political derailment | Bounded political pivots with relevance safeguards | Remain visible |
| Reddit Moment | Combinations of mocking, shaming, and dismissive patterns | Remain visible |
| Political noise — aggressive | Recognized political wording, even when relevant or factual | Entire branch collapses |

These switches are independent and start off. Enable **Political noise — aggressive** for broad political blocking, or **Reddit Moment → Standard** for rhetorical filtering. Conservative requires stronger evidence. Hover a label for the reason and click its reveal control to inspect a match. Reload the extension from the browser's Extensions page after source updates, then refresh Reddit. Ordinary settings changes apply immediately.

### Available filters

- **Political noise — aggressive (opt-in):** blocks recognized political names, parties, ideologies, and slogans on either side, regardless of relevance, sources, or accuracy. Examples include Republicans/conservatives/MAGA, Democrats/liberals/progressives, capitalism/socialism, and "orange Jesus" or "pedo-in-chief." A matching comment folds its entire reply branch, overriding Keep replies visible, with a POLITICAL NOISE reveal control and the matched term in its explanation. Always-show users remain exempt individually, but their replies can be inside a collapsed parent branch. This is deliberate keyword-based personal topic blocking, separate from contextual derailment detection; it does not classify an author's beliefs and can overmatch ordinary uses of words such as "liberal."

- Collapse stock phrases, tired memes, known copypasta, GIF-only and emoji-only comments, bare links, and bot replies.
- Optionally filter image-only comments, quote-only comments, short comments, downvoted comments, and chains of short replies.
- Turn individual rules on or off and adjust word-count, score, and reply-chain thresholds.
- Choose **Standard** (the default, original behavior) or **Conservative** cliché sensitivity. Conservative uses a smaller set of clear stock phrases and more specific copypasta openers, preserving ordinary acknowledgments and broad openings such as "In the year 2000." Other enabled filters can still collapse those comments.
- Set reply-chain sensitivity independently: **Standard** keeps the original short-reply behavior; **Conservative** requires consecutive replies from the same recognized meme family (such as "and my axe/sword/bow") or repetitions of the same recognized reaction. It preserves short question-and-answer exchanges and unknown joke or lyric chains. Enable the reply-chain rule to use either mode; the configured minimum chain length still applies.
- Conservative chains also recognize repeated image-only replies using the same image URL, including known Reddit preview-size variants. Different images and images with explanatory text stay outside this rule. No images are downloaded or analyzed: captions inside images, cropped/reuploaded copies, and sequences of different reaction memes are not recognized. Repeated useful images can also match, so collapse remains reversible.
- Both cliché sensitivities recognize bounded variations of upvote reactions, "you win the internet today," "that's enough Reddit for today," and "the real … was the friends we made along the way." These match whole comments only; added explanations stay outside these new patterns. Conservative chains group variations of the same template. Other enabled rules still apply.
- **Reddit Moment filtering (opt-in):** collapses combinations of mocking labels, sweeping blame, personal attacks, shaming, dismissals, and formulaic motive/ideology framing. It works independently of political relevance. Standard requires at least two pattern families totaling 4 points; Conservative raises the threshold to 6. These are deterministic rules, not learned judgments or probabilities. Matches show a REDDIT MOMENT badge with reasons on hover and click-to-reveal; replies stay visible even in Hide mode. Quotes, source links, code, comments over 3,000 characters, and some concrete-explanation markers are skipped. GIF links are treated as media rather than sources. Standard also recognizes sarcastic-style framing paired with hidden-influence insinuations, and a bounded "…lied? About…?" question paired with a GIF. No party or identity reference is required for that question pattern; the GIF's expression is not analyzed. This covers a subset of the supplied examples and variations; it can miss comments or produce false positives. The historical review lab is not required and uses a separate prototype scorer.
- **Experimental political pivots (off by default):** **Conservative**, the default sensitivity, requires an explicit introduction such as "Off topic, but…" followed by recognized political terms. **Standard** also recognizes bounded whole-comment blame/taunt templates such as "This is what happens when you vote for Republicans" or "Democrats ruined everything," using the same templates across supported targets. Added explanations do not match these new templates. Both check the visible post, subreddit, and ancestor comments, preserving recognized political/policy contexts and skipping missing or ambiguous context. Names alone never trigger it. Matches retain replies and always offer collapse/reveal with an explanation, even in Hide mode. Other filters still apply. These English-only heuristics will miss most subtle derailments and can still make mistakes; they do not understand intent, linked articles, or image text.
- Add your own wildcard or regex patterns and try them in the popup's comment tester.
- Maintain muted-user and always-show lists.
- See why a comment was collapsed and reveal it when you want. Complete hiding is also optional.
- Choose whether to keep replies visible when collapsing a comment, with reply chains folded as a group.
- See per-page and all-time filtering counts.

The current rules are deterministic heuristics. They can make mistakes, and short reply chains are detected by structure and length, not by understanding the conversation.

## Where we're headed

- **Political derailment:** catch unrelated political or ideological commentary regardless of affiliation, without simply blocking political keywords.
- **Repetition and joke chains:** improve detection of recycled jokes, song lyric chains, and low-effort pile-ons.
- **Rage bait:** identify posts and comments whose main purpose is to provoke reactions.
- **Performative moralizing:** catch grandstanding that hijacks an unrelated discussion.
- **Context awareness:** preserve relevant political discussion, legitimate criticism, useful information, and genuine conversation.
- **More control:** add individual category sensitivity settings and clearer explanations.
- **Feedback:** eventually support choices such as "Never show me comments like this."

The contextual filters aim to reduce disruptive behavior while preserving useful discussion. The separate aggressive political-noise mode deliberately prioritizes a personal topic preference over relevance. Changes are incremental and tested against both matches and conversations that should stay visible.

See the [grouped roadmap](docs/ROADMAP.md) and [comprehensive filtering targets](docs/FILTERING_TARGETS.md) for the full direction. These are development goals, not claims that every category is already supported.

## Privacy and approach

Filtering currently runs in your browser using deterministic rules. There is no AI integration, tracking, analytics, or extension-initiated network traffic.

Preferences use the browser's extension sync storage and may sync through your browser account. The all-time counter stays in local extension storage. Permissions are limited to storage and Reddit pages. See [PRIVACY.md](PRIVACY.md) for the inherited privacy policy.

Future OpenAI API integration may be offered as an optional feature for more advanced classification. There is no requirement for local AI models. Any future data-sharing behavior will be documented before that feature is introduced.

## Install locally

This fork has not published a browser-store release yet.

1. Clone this repository or download and extract its source:

   ```bash
   git clone https://github.com/sutherls/Redditor-Repellent.git
   ```

2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**, choose **Load unpacked**, and select the folder containing `manifest.json`.
4. Open a Reddit comment thread and use the extension popup to choose your filters.

The installed extension appears as **Redditor Repellent**. After pulling changes, reload the extension and refresh your Reddit tabs to update its scripts, name, and icon.

If an update leaves a new filter unavailable, use **Reload** on Redditor Repellent's card at `chrome://extensions` or `edge://extensions`, then refresh Reddit. The popup reports missing optional modules; existing filters continue working. `test/missing-module.html` verifies this recovery behavior.

The popup also has a **Reload extension** button that saves pending settings before restarting the extension. Refresh your open Reddit tabs afterward to load the updated code. Ordinary settings changes apply automatically and do not require a reload.

The extension rechecks comments when Reddit replaces their bodies or updates their text after loading. This addresses a reproduced stale-comment problem; if filtering still disappears after a thread refresh, report the thread URL and what the popup shows so we can investigate that case.

On old Reddit, automatic collapses are marked so Reddit Enhancement Suite does not save them as your manual choices. Matching comments that Reddit, RES, or you already collapsed still receive labels and appear in the summary as **already collapsed**, without increasing the lifetime tally. They stay closed when settings change; clicking **Show them** explicitly opens matched comments, including those prior collapses.

## Development

Plain JavaScript, HTML, and CSS. No dependency installation or build step is needed to load the extension.

| File | Purpose |
|---|---|
| `manifest.json` | Extension configuration and permissions |
| `src/content.js` | Reddit page handling, classification, collapsing, and counters |
| `src/text-rules.js` | Stock-phrase and copypasta matching |
| `src/media-rules.js` | Repeated-image URL identity without image downloads |
| `src/patterns.js` | Normalization and custom pattern matching |
| `src/background.js` | Toolbar badge and lifetime tally |
| `popup/` | Filter controls and settings |
| `test/` | Text-rule regression tests and browser fixtures |

Run the text-rule tests with Node.js:

```bash
node --test test/text-rules.test.cjs
node --test test/media-rules.test.cjs
node --test test/politics-rules.test.cjs
node --test test/moment-rules.test.cjs
```

To check the browser fixture, serve the repository locally, for example with `python -m http.server 8765`, then open `http://localhost:8765/test/fixture.html` and click **Run all scenarios**.

The same server also provides `test/lifecycle.html` for comment replacement, edits, and settings updates, and `test/popup.html` for save-before-reload behavior. These fixtures simulate Reddit markup and browser extension APIs; they do not replace testing the installed extension on Reddit.

`test/res-persistence.html` covers the RES automatic-collapse marker, labels and counts for prior collapses, and explicit reveal behavior. Its persistence simulation follows [RES's commentHidePersistor module](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/lib/modules/commentHidePersistor.js).

`test/chains.html` checks both reply-chain sensitivities on old and modern Reddit markup, including useful conversations, meme families, late replies, minimum length, and always-show users.

`test/politics.html` checks political pivots on old and modern Reddit markup, including viewpoint symmetry, missing/late context, ancestor protection, always-show users, reveal, and live disabling. These are local fixtures; real Reddit testing is still needed.

`test/moments.html` checks actual Reddit Moment collapse/reveal, explanations, reply preservation, sensitivity changes, edited comments, quotations, and live disabling on both layouts.

For a distributable ZIP on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/package.ps1
```

On macOS/Linux, run `sh scripts/package.sh`. Packaging creates `dist/redditor-repellent-<version>.zip` and includes the MIT license.

## Credits and license

The original project by **Chris Hoyt / recruiterguy**, linked above, provides the foundation for comment filtering, customization, and collapse/reveal behavior.

Released under the [MIT License](LICENSE). The original copyright and permission notice are preserved.

Not affiliated with or endorsed by Reddit, Inc.
