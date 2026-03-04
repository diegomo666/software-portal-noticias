const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };

const routes = {
  '/api/noticias': 'noticias.json',
  '/api/seccion-imagen-texto': 'seccion-imagen-texto.json',
  '/api/seccion-texto': 'seccion-texto.json',
  '/api/seccion-imagenes': 'seccion-imagenes.json',
};

function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  return 'text/plain; charset=utf-8';
}

async function sendJsonFile(res, fileName) {
  try {
    const filePath = path.join(BASE_DIR, 'content', fileName);
    const raw = await fs.readFile(filePath, 'utf8');
    res.writeHead(200, jsonHeaders);
    res.end(raw);
  } catch (error) {
    res.writeHead(500, jsonHeaders);
    res.end(JSON.stringify({ error: 'No se pudo cargar el contenido.' }));
  }
}

async function sendStaticFile(res, requestPath) {
  const safePath = requestPath === '/' ? '/index.html' : requestPath;
  const filePath = path.join(BASE_DIR, 'public', safePath);

  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Recurso no encontrado');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (routes[url.pathname]) {
    await sendJsonFile(res, routes[url.pathname]);
    return;
  }

  await sendStaticFile(res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
