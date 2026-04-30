import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const gamesFile = path.resolve('.local', 'games.json');

const readBody = async (req: import('node:http').IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

const localGamesApi = () => ({
  name: 'local-games-api',
  configureServer(server: import('vite').ViteDevServer) {
    server.middlewares.use('/api/games', async (req, res) => {
      fs.mkdirSync(path.dirname(gamesFile), { recursive: true });
      if (!fs.existsSync(gamesFile)) fs.writeFileSync(gamesFile, '[]', 'utf8');

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');

      if (req.method === 'GET') {
        res.end(fs.readFileSync(gamesFile, 'utf8'));
        return;
      }

      if (req.method === 'PUT') {
        const body = await readBody(req);
        JSON.parse(body);
        fs.writeFileSync(gamesFile, body, 'utf8');
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Method not allowed' }));
    });
  },
});

export default defineConfig({
  base: './',
  plugins: [react(), localGamesApi()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
