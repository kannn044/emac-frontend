import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

export function createStaticServer(directory = root) {
  const base = resolve(directory);
  return createServer(async (req, res) => {
    const fail = (status, message) => {
      res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(message);
    };
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD');
      return fail(405, 'Method not allowed');
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { return fail(400, 'Invalid URL'); }
    // API requests must go through nginx, never fall back to index.html.
    if (/^\/(auth|api|embed)(\/|$)/.test(pathname) || pathname === '/healthz') {
      return fail(404, 'API route: configure nginx proxy');
    }
    let file = resolve(base, '.' + pathname);
    if (file !== base && !file.startsWith(base + sep)) return fail(403, 'Forbidden');
    try {
      const info = await stat(file).catch(() => null);
      if (!info?.isFile()) {
        if (extname(pathname) || pathname.startsWith('/assets/')) return fail(404, 'Not found');
        file = resolve(base, 'index.html');
      }
      const body = await readFile(file);
      res.writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
        'Content-Length': body.length,
        'Cache-Control': file.startsWith(resolve(base, 'assets') + sep) ? 'public, max-age=31536000, immutable' : 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { fail(500, 'Cannot read frontend build'); }
  });
}

