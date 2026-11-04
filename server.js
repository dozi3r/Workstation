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

// Import campaign CLI & mutation engine for loopback endpoints
let campaignCli = null;
try {
    campaignCli = require(path.join(ROOT_DIR, 'scripts', 'campaign_cli.js'));
} catch (e) {
    console.warn('[SERVER] Could not load scripts/campaign_cli.js:', e.message);
}
let CampaignMutationEngine = null;
try {
    CampaignMutationEngine = require(path.join(ROOT_DIR, 'src', 'workstation', 'scripts', 'campaign_mutation_engine.js'));
} catch (e) {}

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

function sendJsonResponse(res, statusCode, data) {
    sendCorsHeaders(res);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    res.end(JSON.stringify(data, null, 2));
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

        const parsedUrl = url.parse(req.url, true);
        let pathname = decodeURIComponent(parsedUrl.pathname);
        const query = parsedUrl.query || {};

        // API endpoints
        if (pathname === '/api/status') {
            sendJsonResponse(res, 200, {
                status: 'running',
                version: '2.5.0',
                engine: 'node',
                port: port,
                rootDir: ROOT_DIR
            });
            return;
        }

        // Campaign loopback endpoints
        if (pathname === '/api/campaign/sync-status' && req.method === 'GET') {
            const campQuery = query.campaign || query.slug || query.id;
            if (!campaignCli) {
                sendJsonResponse(res, 500, { status: 'error', message: 'Campaign CLI module unavailable' });
                return;
            }
            const folder = campaignCli.resolveCampaignFolder(path.join(ROOT_DIR, 'campaigns'), campQuery);
            if (!folder) {
                sendJsonResponse(res, 404, { status: 'error', message: `Campaign "${campQuery}" not found` });
                return;
            }
            try {
                const state = campaignCli.loadCampaignState(path.join(ROOT_DIR, 'campaigns', folder), folder);
                const summary = CampaignMutationEngine ? CampaignMutationEngine.getSummary(state) : { census: {} };
                sendJsonResponse(res, 200, {
                    status: 'ok',
                    campaign: folder,
                    id: state.id,
                    name: state.name,
                    syncToken: state.syncToken,
                    lastBatchId: state.appliedBatchIds && state.appliedBatchIds.length > 0 ? state.appliedBatchIds[state.appliedBatchIds.length - 1] : null,
                    census: summary.census
                });
            } catch (err) {
                sendJsonResponse(res, 500, { status: 'error', message: err.message });
            }
            return;
        }

        if (pathname === '/api/campaign/changelog' && req.method === 'GET') {
            const campQuery = query.campaign || query.slug || query.id;
            if (!campaignCli) {
                sendJsonResponse(res, 500, { status: 'error', message: 'Campaign CLI module unavailable' });
                return;
            }
            const folder = campaignCli.resolveCampaignFolder(path.join(ROOT_DIR, 'campaigns'), campQuery);
            if (!folder) {
                sendJsonResponse(res, 404, { status: 'error', message: `Campaign "${campQuery}" not found` });
                return;
            }
            const changelogPath = path.join(ROOT_DIR, 'campaigns', folder, 'changelog.json');
            let changelog = [];
            if (fs.existsSync(changelogPath)) {
                try { changelog = JSON.parse(fs.readFileSync(changelogPath, 'utf8')); } catch (e) { changelog = []; }
            }
            sendJsonResponse(res, 200, changelog);
            return;
        }

        if (pathname === '/api/campaign/load' && req.method === 'GET') {
            const campQuery = query.campaign || query.slug || query.id;
            if (!campaignCli) {
                sendJsonResponse(res, 500, { status: 'error', message: 'Campaign CLI module unavailable' });
                return;
            }
            const folder = campaignCli.resolveCampaignFolder(path.join(ROOT_DIR, 'campaigns'), campQuery);
            if (!folder) {
                sendJsonResponse(res, 404, { status: 'error', message: `Campaign "${campQuery}" not found` });
                return;
            }
            try {
                const state = campaignCli.loadCampaignState(path.join(ROOT_DIR, 'campaigns', folder), folder);
                sendJsonResponse(res, 200, {
                    status: 'ok',
                    campaign: folder,
                    id: state.id,
                    name: state.name,
                    syncToken: state.syncToken,
                    appliedBatchIds: state.appliedBatchIds,
                    entities: state.entities,
                    activeTopology: state.activeTopology,
                    maps: state.maps,
                    changelog: state.changelog
                });
            } catch (err) {
                sendJsonResponse(res, 500, { status: 'error', message: err.message });
            }
            return;
        }

        if (pathname === '/api/campaign/save' && req.method === 'POST') {
            const campQuery = query.campaign || query.slug || query.id;
            if (!campaignCli) {
                sendJsonResponse(res, 500, { status: 'error', message: 'Campaign CLI module unavailable' });
                return;
            }
            const folder = campaignCli.resolveCampaignFolder(path.join(ROOT_DIR, 'campaigns'), campQuery);
            if (!folder) {
                sendJsonResponse(res, 404, { status: 'error', message: `Campaign "${campQuery}" not found` });
                return;
            }
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const payload = JSON.parse(body || '{}');
                    const campDir = path.join(ROOT_DIR, 'campaigns', folder);
                    const state = campaignCli.loadCampaignState(campDir, folder);
                    if (payload.entities) state.entities = payload.entities;
                    if (payload.activeTopology) state.activeTopology = payload.activeTopology;
                    if (payload.maps) state.maps = payload.maps;
                    if (Array.isArray(payload.appliedBatchIds)) state.appliedBatchIds = payload.appliedBatchIds;
                    const diskRes = campaignCli.saveCampaignStateToDisk(state, campDir, payload.batchRecord || null);
                    sendJsonResponse(res, 200, {
                        status: 'ok',
                        campaign: folder,
                        syncToken: diskRes.syncToken,
                        savedAt: diskRes.updatedAt
                    });
                } catch (err) {
                    sendJsonResponse(res, 500, { status: 'error', message: err.message });
                }
            });
            return;
        }

        if (pathname === '/api/modules' && req.method === 'GET') {
            try {
                const campaignsDir = path.join(ROOT_DIR, 'campaigns');
                const liveModules = [];
                if (fs.existsSync(campaignsDir)) {
                    const campFolders = fs.readdirSync(campaignsDir, { withFileTypes: true }).filter(d => d.isDirectory());
                    campFolders.forEach(camp => {
                        const modDir = path.join(campaignsDir, camp.name, 'modules');
                        if (!fs.existsSync(modDir)) return;
                        const walkDir = (dir) => {
                            fs.readdirSync(dir, { withFileTypes: true }).forEach(ent => {
                                const fullP = path.join(dir, ent.name);
                                if (ent.isDirectory()) walkDir(fullP);
                                else if (ent.name.endsWith('.md')) {
                                    const raw = fs.readFileSync(fullP, 'utf8');
                                    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
                                    const body = fmMatch ? fmMatch[2].trim() : raw.trim();
                                    const fm = fmMatch ? fmMatch[1] : '';
                                    const getScalar = (k) => {
                                        const m = fm.match(new RegExp('^' + k + ':\\s*["\']?([^"\'\\r\\n]+)["\']?', 'm'));
                                        return m ? m[1].trim() : null;
                                    };
                                    const modId = getScalar('id') || path.basename(ent.name, '.md');
                                    const title = getScalar('title') || modId;
                                    const tier = parseInt(getScalar('pipeline_tier') || '2', 10) || 2;
                                    liveModules.push({
                                        id: modId,
                                        title: title,
                                        campaignId: camp.name,
                                        pipeline_tier: tier,
                                        culture_quadrant: getScalar('culture_quadrant') || 'Hierarchy',
                                        fallback: getScalar('standalone_fallback') || '',
                                        content: body
                                    });
                                }
                            });
                        };
                        walkDir(modDir);
                    });
                }
                sendJsonResponse(res, 200, { status: 'ok', count: liveModules.length, modules: liveModules });
            } catch (err) {
                sendJsonResponse(res, 500, { status: 'error', message: err.message });
            }
            return;
        }

        if (pathname === '/api/shutdown' && (req.method === 'POST' || req.method === 'GET')) {
            sendJsonResponse(res, 200, { message: 'Server shutting down' });
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
