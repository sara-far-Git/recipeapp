import { expect, it } from 'vitest';
import { worthRetrying } from './api';

// The API sleeps when idle and takes most of a minute to wake, so the first
// request after a quiet spell fails with no response at all. That is the case
// this exists for.
it('retries when there was no response', () => {
  expect(worthRetrying(new Error('timeout of 30000ms exceeded'))).toBe(true);
  expect(worthRetrying({})).toBe(true);
});

it('retries what the server may yet answer differently', () => {
  for (const status of [429, 500, 502, 503, 504]) {
    expect(worthRetrying({ response: { status } })).toBe(true);
  }
});

it('does not retry an answer that will not change', () => {
  for (const status of [400, 401, 403, 404, 422]) {
    expect(worthRetrying({ response: { status } })).toBe(false);
  }
});
