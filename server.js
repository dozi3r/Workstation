/**
 * CREATOR STUDIO 2.5 - ZERO-INSTALL LOCAL LOOPBACK SERVER
 * Native Node.js HTTP static server with dynamic port resolution,
 * full MIME type mappings, CORS headers, and graceful shutdown.
 * 
 * Usage:
 *   node server.js [--port 8080] [--open] [--no-open]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');

const ROOT_DIR = path.resolve(__dirname);
const DEFAULT_PORT = parseInt(process.env.PORT || '8080', 10);
const MAX_PORT_ATTEMPTS = 20;

// CLI argument parsing
const args = process.argv.slice(2);
let requestedPort = DEFAULT_PORT;
let shouldOpen = false;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
        requestedPort = parseInt(args[i + 1], 10);
        i++;
    } else if (args[i] === '--open') {
        shouldOpen = true;
    } else if (args[i] === '--no-open') {
        shouldOpen = false;
    }
}

// Comprehensive MIME table
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.md': 'text/markdown; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.wasm': 'application/wasm',
    '.zip': 'application/zip',
    '.tar': 'application/x-tar',
    '.pdf': 'application/pdf'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

function sendCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization');
}

function openBrowser(targetUrl) {
    const startCmd = process.platform === 'win32'
        ? `start "" "${targetUrl}"`
        : process.platform === 'darwin'
            ? `open "${targetUrl}"`
            : `xdg-open "${targetUrl}"`;
    exec(startCmd, (err) => {
        if (err) console.warn('[SERVER] Could not automatically open browser:', err.message);
    });
}

function createServer(port, callback) {
    const server = http.createServer((req, res) => {
        sendCorsHeaders(res);

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        const parsedUrl = url.parse(req.url);
        let pathname = decodeURIComponent(parsedUrl.pathname);

        // API endpoints
        if (pathname === '/api/status') {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                status: 'running',
                version: '2.5.0',
                engine: 'node',
                port: port,
                rootDir: ROOT_DIR
            }, null, 2));
            return;
        }

        if (pathname === '/api/shutdown' && (req.method === 'POST' || req.method === 'GET')) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ message: 'Server shutting down' }));
            console.log('\n[SERVER] Shutdown signal received via /api/shutdown.');
            setTimeout(() => {
                server.close(() => process.exit(0));
            }, 300);
            return;
        }

        // Default routing: '/' -> '/start.html'
        if (pathname === '/' || pathname === '') {
            pathname = '/start.html';
        }

        // Prevent directory traversal attacks
        const safePath = path.normalize(path.join(ROOT_DIR, pathname));
        if (!safePath.startsWith(ROOT_DIR)) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('403 Forbidden: Directory traversal blocked.');
            return;
        }

        fs.stat(safePath, (err, stats) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`404 Not Found: ${pathname}`);
                return;
            }

            let fileToServe = safePath;
            if (stats.isDirectory()) {
                // Check if directory contains start.html or index.html
                const startIndex = path.join(safePath, 'start.html');
                const defaultIndex = path.join(safePath, 'index.html');
                if (fs.existsSync(startIndex)) {
                    fileToServe = startIndex;
                } else if (fs.existsSync(defaultIndex)) {
                    fileToServe = defaultIndex;
                } else {
                    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('403 Forbidden: Directory listing disabled.');
                    return;
                }
            }

            const mime = getMimeType(fileToServe);
            res.writeHead(200, {
                'Content-Type': mime,
                'Cache-Control': 'no-cache',
                'X-Content-Type-Options': 'nosniff'
            });

            const stream = fs.createReadStream(fileToServe);
            stream.pipe(res);
            stream.on('error', (streamErr) => {
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end(`500 Internal Server Error: ${streamErr.message}`);
                }
            });
        });
    });

    server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            callback(err, null);
        } else {
            console.error('[SERVER] Fatal server error:', err);
            process.exit(1);
        }
    });

    server.once('listening', () => {
        callback(null, server);
    });

    server.listen(port, '127.0.0.1');
}

function startLoopback(startPort, attempt = 0) {
    if (attempt >= MAX_PORT_ATTEMPTS) {
        console.error(`[ERROR] Could not find an available port after ${MAX_PORT_ATTEMPTS} attempts.`);
        process.exit(1);
    }

    const currentPort = startPort + attempt;
    createServer(currentPort, (err, server) => {
        if (err && err.code === 'EADDRINUSE') {
            console.log(`[INFO] Port ${currentPort} in use, trying ${currentPort + 1}...`);
            startLoopback(startPort, attempt + 1);
            return;
        }

        const appUrl = `http://127.0.0.1:${currentPort}/start.html`;
        console.log('========================================================');
        console.log('   CREATOR STUDIO 2.0 - LOCAL LOOPBACK ACTIVE           ');
        console.log('========================================================');
        console.log(`  Loopback Address : http://127.0.0.1:${currentPort}/`);
        console.log(`  Workstation App  : ${appUrl}`);
        console.log(`  MIME Engine      : Enabled (HTML, JS, CSS, JSON, Images, Audio, WASM)`);
        console.log(`  Security Origin  : Secure Context (CORS / Storage partition unlocked)`);
        console.log('--------------------------------------------------------');
        console.log('  Press Ctrl+C in this console to stop the workstation.');
        console.log('========================================================\n');

        if (shouldOpen) {
            console.log(`[LAUNCH] Opening browser to ${appUrl}...`);
            openBrowser(appUrl);
        }
    });
}

// Graceful process exit
process.on('SIGINT', () => {
    console.log('\n[SERVER] Shutting down Creator Studio 2.0 loopback server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n[SERVER] Shutting down Creator Studio 2.0 loopback server...');
    process.exit(0);
});

startLoopback(requestedPort);
