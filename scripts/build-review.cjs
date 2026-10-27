/* Produce a standalone, offline review page. No runtime dependencies. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const folder = path.join(root, 'test/reddit-moment');
const destination = path.resolve(process.argv[2] || path.join(root, 'dist/reddit-moment-review.html'));
let html = fs.readFileSync(path.join(folder, 'index.html'), 'utf8');
for (const name of ['scorer.js', 'cases.js', 'review.js']) {
  let source = fs.readFileSync(path.join(folder, name), 'utf8');
  if (name === 'review.js') source = `globalThis.RedditMomentCorpus = ${JSON.stringify(fs.readFileSync(path.join(root, 'docs/REDDIT_MOMENT_EXAMPLES.txt'), 'utf8')).replace(/</g, '\\u003c')};\n` + source;
  html = html.replace(`<script src="${name}"></script>`, () => `<script>${source.replace(/<\/script/gi, '<\\/script')}</script>`);
}
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, html);
console.log(`Wrote ${destination}`);
