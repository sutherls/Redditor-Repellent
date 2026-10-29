# Privacy Policy — Redditor Repellent

Last updated: 2026-10-28

I develop Redditor Repellent as a solo developer. The extension does not send me browsing content, telemetry, or settings, and I do not operate a data-collection service for it.

## On-device processing

The extension runs on the Reddit hosts listed in its manifest. It reads visible comment text, usernames, scores, media URLs, and relevant post/subreddit/ancestor context to decide which comments to filter. Pile-on comparisons and other classification run locally. Temporary matching state stays in page memory; the extension does not save a comment-history database.

It makes no network requests of its own, downloads no images for analysis, and uses no AI service, analytics, tracking, or extension-specific account.

## Saved preferences

Filter switches, sensitivity and display settings, muted/allowed usernames, and custom patterns are stored through the browser's extension sync storage. These preferences may sync through your browser account according to the browser provider's settings and policies. Custom patterns can contain text you enter, so do not put sensitive information in them if you do not want it included in browser sync.

The all-time filtering counter is a single number in local extension storage. It can be reset from the popup. Preferences can be changed or cleared using the popup's controls.

## Future features and support

Different-image reaction chains, a Hide more like this action, per-subreddit settings, and optional OpenAI integration are not implemented. Any future data-sharing behavior will be documented before introduction.

If you voluntarily submit an issue, GitHub processes the information you include. Avoid posting private information in public issues.

[Questions or issues](https://github.com/sutherls/Redditor-Repellent/issues)
