import { stat } from 'node:fs/promises';
import { createStaticServer } from './static-server.mjs';

// PM2 imports this entrypoint through its own wrapper; always start the server.
await stat(new URL('../dist/index.html', import.meta.url));
const port = Number(process.env.PORT || 4180);
const server = createStaticServer();
server.listen(port, '127.0.0.1', () => {
  console.log(`emac-web listening on http://127.0.0.1:${server.address().port}`);
});
