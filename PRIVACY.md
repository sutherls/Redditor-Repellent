# Privacy Policy — Redditor Repellent

Last updated: 2026-11-01

I develop Redditor Repellent as a solo developer. The extension does not send me browsing content, telemetry, or settings, and I do not operate a data-collection service for it.

## On-device processing

The extension runs on the Reddit hosts listed in its manifest. It reads visible comment text, usernames, scores, media URLs, and relevant post/subreddit/ancestor context to decide which comments to filter. Pile-on comparisons and other classification run locally. Temporary matching state stays in page memory; the extension does not save a comment-history database.

It makes no network requests of its own, downloads no images for analysis, and uses no AI service, analytics, tracking, or extension-specific account.

## Saved preferences

Filter switches, sensitivity and display settings, muted/allowed usernames, and custom patterns are stored through the browser's extension sync storage. These preferences may sync through your browser account according to the browser provider's settings and policies. Custom patterns can contain text you enter, so do not put sensitive information in them if you do not want it included in browser sync.

The all-time filtering counter is a single number in local extension storage. It can be reset from the popup. Preferences can be changed or cleared using the popup's controls.

Per-subreddit settings save the community names you explicitly customize and their filter/behavior preferences in browser extension sync storage, up to 50 communities. They may sync through your browser account. Merely visiting a community does not save a profile. No comment text or visit history is stored with these profiles. Choose that community under **Settings scope** and use **Use global filters for this community** to remove its saved profile.

**Hide more like this** stores only the phrase you confirm, its match type, a normalized copy used for matching, and an identifier in local extension storage. These saved phrases are not put in browser sync or sent to the developer. They persist on this device until removed (or extension data is cleared). Remove them under **Saved phrases — this device** in the popup. The extension does not save the source comment's author, thread URL, or surrounding discussion as part of the rule. Saving a whole-comment phrase does retain that confirmed text locally.

**Always show this comment** stores only the selected Reddit comment ID in local extension storage, up to 1,000 IDs. IDs can identify the comments you chose to exempt, but no comment text, author, surrounding thread, or feedback reason is saved by this feature. They are not synced or sent to me. Exceptions persist until undone beside the comment, removed in the popup, or extension data is cleared. This is a display preference, not a submitted false-positive report or training data.

## Future features and support

Reaction-image chains use only the existing page's image URLs and reply structure; no images are downloaded for analysis. Optional OpenAI integration is not implemented. Any future data-sharing behavior will be documented before introduction.

If you voluntarily submit an issue, GitHub processes the information you include. Avoid posting private information in public issues.

[Questions or issues](https://github.com/sutherls/Redditor-Repellent/issues)
