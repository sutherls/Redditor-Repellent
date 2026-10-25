# Redditor Repellent

**Reddit without the Redditors.**

Less circlejerking. Fewer tired memes. More of the discussion you actually came for.

Redditor Repellent is a highly customizable browser extension built to cut through repetitive comments, political grandstanding, rage bait, and terminally online commentary. Finally, you can enjoy Reddit without having to experience Reddit.

A fork of [Not This.](https://github.com/recruiterguy/not-this) by Chris Hoyt, building upon an already great extension.

## Where things stand

This project is in early development. The existing low-effort comment filters work today; contextual filtering for political derailment, rage bait, and performative moralizing is planned. Those advanced filters are not implemented yet.

Chrome and Microsoft Edge are our first development targets. The inherited code supports both modern Reddit and old.reddit.com and includes Firefox support.

## What works today

- Collapse stock phrases, tired memes, known copypasta, GIF-only and emoji-only comments, bare links, and bot replies.
- Optionally filter image-only comments, quote-only comments, short comments, downvoted comments, and chains of short replies.
- Turn individual rules on or off and adjust word-count, score, and reply-chain thresholds.
- Choose **Standard** (the default, original behavior) or **Conservative** cliché sensitivity. Conservative uses a smaller set of clear stock phrases and more specific copypasta openers, preserving ordinary acknowledgments and broad openings such as "In the year 2000." Other enabled filters can still collapse those comments.
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

The goal is to filter disruptive behavior, not particular viewpoints. Changes will be incremental and tested against examples that should be filtered and conversations that should stay visible.

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

The installed extension still appears as **Not This.** while the fork's branding is being updated. After pulling changes, reload the extension on the Extensions page and refresh your Reddit tabs.

## Development

Plain JavaScript, HTML, and CSS. No dependency installation or build step is needed to load the extension.

| File | Purpose |
|---|---|
| `manifest.json` | Extension configuration and permissions |
| `src/content.js` | Reddit page handling, classification, collapsing, and counters |
| `src/text-rules.js` | Stock-phrase and copypasta matching |
| `src/patterns.js` | Normalization and custom pattern matching |
| `src/background.js` | Toolbar badge and lifetime tally |
| `popup/` | Filter controls and settings |
| `test/` | Text-rule regression tests and browser fixtures |

Run the text-rule tests with Node.js:

```bash
node --test test/text-rules.test.cjs
```

To check the browser fixture, serve the repository locally, for example with `python -m http.server 8765`, then open `http://localhost:8765/test/fixture.html` and click **Run all scenarios**.

For a distributable ZIP on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/package.ps1
```

On macOS/Linux, run `sh scripts/package.sh`. Packaging still uses the inherited filename `dist/not-this-<version>.zip` and includes the MIT license.

## Credits and license

Redditor Repellent builds on **Not This.**, created by **Chris Hoyt / recruiterguy**. The original project provides the foundation for comment filtering, customization, and collapse/reveal behavior.

Released under the [MIT License](LICENSE). The original copyright and permission notice are preserved.

Not affiliated with or endorsed by Reddit, Inc.
