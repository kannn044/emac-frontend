import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createStaticServer } from '../scripts/serve.mjs';

test('built frontend serves SPA and assets but never masks missing API proxy', async () => {
  const server = createStaticServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const home = await fetch(base);
    assert.equal(home.status, 200);
    assert.equal(home.headers.get('cache-control'), 'no-cache');
    const html = await home.text();
    const asset = html.match(/src="(\/assets\/[^\"]+\.js)"/)[1];
    const js = await fetch(base + asset);
    assert.match(js.headers.get('content-type'), /javascript/);
    assert.match(js.headers.get('cache-control'), /immutable/);
    assert.equal(await (await fetch(base + '/patients/demo')).text(), html);
    for (const path of ['/auth/mode', '/api/v1/patients', '/embed/card/test', '/assets/missing.js']) {
      assert.equal((await fetch(base + path)).status, 404);
    }
    assert.equal((await fetch(base, { method: 'POST' })).status, 405);
    const head = await fetch(base, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
