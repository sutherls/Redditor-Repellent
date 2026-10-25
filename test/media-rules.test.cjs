'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
require('../src/media-rules.js');
const { imageIdentity } = globalThis.NotThisMediaRules;

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
