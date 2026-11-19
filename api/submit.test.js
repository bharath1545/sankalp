// Run with: node --test api/submit.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('./submit.js');

function call(method, body) {
  const res = {
    statusCode: 0,
    headers: {},
    body: undefined,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  return handler({ method, body }, res).then(() => res);
}

function at(iso) {
  test.mock.timers.enable({ apis: ['Date'], now: new Date(iso) });
}

test.afterEach(() => test.mock.timers.reset());

test('refuses submissions after the deadline with 410', async () => {
  at('2026-11-16T00:00:00+05:30');
  const res = await call('POST', { website: '', teamName: 'x' });
  assert.equal(res.statusCode, 410);
  assert.equal(res.body.error, 'Abstract registration is closed.');
});

test('still processes a request late on the deadline day (IST)', async () => {
  at('2026-11-15T23:59:00+05:30');
  // Honeypot filled: the function answers with silent success, so it got past the closed check.
  const res = await call('POST', { website: 'bot' });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true });
});

test('processes requests before the deadline', async () => {
  at('2026-11-10T10:00:00+05:30');
  const res = await call('POST', { website: 'bot' });
  assert.equal(res.statusCode, 200);
});

test('still rejects non-POST with 405 after the deadline', async () => {
  at('2026-11-20T10:00:00+05:30');
  const res = await call('GET');
  assert.equal(res.statusCode, 405);
});
