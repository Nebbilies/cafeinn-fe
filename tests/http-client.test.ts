import assert from 'node:assert/strict';
import test from 'node:test';
import { requestJson } from '../src/shared/api/http-client.ts';
import { ApiError } from '../src/shared/api/api-error.ts';
import { serve } from './support/http-fixture.ts';

test('returns successful JSON from the HTTP endpoint', async (context) => {
  const url = await serve((_request, response) => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end('{"status":"ok"}');
  }, context);
  assert.deepEqual(await requestJson(url), { status: 'ok' });
});

test('accepts an empty 204 response', async (context) => {
  const url = await serve((_request, response) => {
    response.writeHead(204);
    response.end();
  }, context);
  assert.equal(await requestJson(url), undefined);
});

test('normalizes unsuccessful HTTP responses without exposing server details', async (context) => {
  const url = await serve((_request, response) => {
    response.writeHead(503, { 'content-type': 'application/json' });
    response.end('{"error":{"code":"SERVICE_UNAVAILABLE","message":"private connection detail"}}');
  }, context);
  await assert.rejects(requestJson(url), (error: unknown) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 503);
    assert.equal(error.code, 'SERVICE_UNAVAILABLE');
    assert.equal(error.message, 'API request failed.');
    return true;
  });
});

test('propagates cancellation to an in-flight HTTP request', async (context) => {
  let markStarted = () => {};
  const started = new Promise<void>((resolve) => { markStarted = resolve; });
  const url = await serve(() => { markStarted(); }, context);
  const controller = new AbortController();
  const pending = requestJson(url, { signal: controller.signal });
  const rejected = assert.rejects(pending, { name: 'AbortError' });
  await started;
  controller.abort();
  await rejected;
});
