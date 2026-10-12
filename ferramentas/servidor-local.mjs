/**
 * Servidor estático mínimo da raiz do projeto, só para as ferramentas que
 * precisam abrir as páginas num navegador (PDF, verificação de robô).
 * Escuta em 127.0.0.1, porta livre, e só lê arquivos dentro da raiz.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname } from 'node:path';

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json', '.pdf': 'application/pdf',
};

export async function servir() {
  const servidor = createServer(async (req, res) => {
    try {
      let caminho = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (caminho.includes('..')) throw new Error('fora da raiz');
      if (caminho.endsWith('/')) caminho += 'index.html';
      const corpo = await readFile(join(RAIZ, caminho));
      res.writeHead(200, { 'Content-Type': TIPOS[extname(caminho)] || 'application/octet-stream' });
      res.end(corpo);
    } catch (e) {
      res.writeHead(404).end();
    }
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  return { base: `http://127.0.0.1:${servidor.address().port}`, fechar: () => servidor.close() };
}
