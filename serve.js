// Minimal static file server for Gem Cracker (dev preview).
// Serves the project root so index.html, scripts/, style.css, config, and
// audio/*.mp3 all resolve. No dependencies.
//
// Usage: node serve.js [port]   (default 8127)

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = parseInt(process.argv[2], 10) || 8127;

const MIME = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';

    // Resolve and contain within ROOT.
    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
        res.writeHead(403);
        res.end('403 Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
            return;
        }
        res.writeHead(200, {
            'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-cache',
        });
        res.end(data);
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Gem Cracker dev server: http://127.0.0.1:${PORT}/`);
});
