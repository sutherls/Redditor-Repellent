'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
require('../src/media-rules.js');
const { imageIdentity } = globalThis.RedditorRepellentMediaRules;

test('Reddit preview rendering variants share an identity with the original', () => {
  assert.equal(imageIdentity('https://preview.redd.it/example.png?width=640&format=webp&auto=webp&s=signature'),
    imageIdentity('https://i.redd.it/example.png'));
});

test('different uploads and unknown content parameters remain distinct', () => {
  assert.notEqual(imageIdentity('https://i.redd.it/a.png'), imageIdentity('https://i.redd.it/b.png'));
  assert.notEqual(imageIdentity('https://preview.redd.it/a.png?frame=1'), imageIdentity('https://preview.redd.it/a.png?frame=2'));
  assert.notEqual(imageIdentity('https://example.com/image.png?id=1'), imageIdentity('https://example.com/image.png?id=2'));
});

test('unsupported sources cannot qualify as repeated images', () => {
  for (const value of ['', '/relative.png', 'data:image/png;base64,AAA', 'javascript:void(0)', 'https://example.com/article', 'https://user:password@example.com/image.png']) {
    assert.equal(imageIdentity(value), null, value);
  }
});

test('GIF link detection uses URL structure rather than words in source links', () => {
  const { isGifUrl } = globalThis.RedditorRepellentMediaRules;
  for (const url of ['https://en.wikipedia.org/wiki/GIF','https://example.com/tenor','https://example.com/article?format=gif','https://giphy.com.evil.example/gifs/a','https://giphy.com/articles/gif-history','javascript:gif','https://i.redd.it/image.png']) assert.equal(isGifUrl(url),false,url);
  for (const url of ['https://i.redd.it/a.gif?width=300','https://media.giphy.com/media/a/giphy.gif','https://giphy.com/gifs/reaction-a','https://tenor.com/view/reaction-123','https://redgifs.com/watch/reaction']) assert.equal(isGifUrl(url),true,url);
});
