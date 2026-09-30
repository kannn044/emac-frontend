import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from '../scripts/static-server.mjs';

test('entrypoint opens a port when imported by a process-manager wrapper', async () => {
  const entry = new URL('../scripts/serve.mjs', import.meta.url);
  const child = spawn(process.execPath, ['--input-type=module', '-e',
    `process.argv[1] = '/pm2/ProcessContainerFork.js'; await import(${JSON.stringify(entry.href)});`], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  try {
    const address = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Server never opened a port')), 5000);
      let output = '';
      child.stdout.on('data', chunk => {
        output += chunk;
        const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
        if (match) { clearTimeout(timer); resolve(match[0]); }
      });
      child.once('error', err => { clearTimeout(timer); reject(err); });
      child.once('exit', code => {
        clearTimeout(timer);
        reject(new Error(`Entry exited before listening (${code}): ${stderr}`));
      });
    });
    assert.equal((await fetch(address)).status, 200);
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
  }
});

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
