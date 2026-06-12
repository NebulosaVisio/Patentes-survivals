const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files (no cache during dev)
app.use(express.static(path.join(__dirname), {
    etag: false,
    lastModified: false,
    setHeaders: function(res, filePath) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.set('Pragma', 'no-cache');
    }
}));

// ── CORS proxy for b42map.com tiles ──
// Proxies requests like /map-proxy/base/layer0.dzi
// to https://b42map.com/map_data/base/layer0.dzi
app.get('/map-proxy/{*path}', async (req, res) => {
    let tilePath = req.params.path;
    // Express 5 may return an array for wildcard params
    if (Array.isArray(tilePath)) tilePath = tilePath.join('/');
    const targetUrl = `https://b42map.com/map_data/${tilePath}`;
    console.log(`[proxy] ${req.path} -> ${targetUrl}`);

    try {
        const response = await fetch(targetUrl);
        if (!response.ok) {
            return res.status(response.status).send('Tile not found');
        }

        // Forward content-type
        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.set('Content-Type', contentType);
        }

        // Allow CORS
        res.set('Access-Control-Allow-Origin', '*');

        // Cache tiles for 1 hour
        res.set('Cache-Control', 'public, max-age=3600');

        // Pipe the response
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
    } catch (err) {
        console.error('Proxy error:', err.message);
        res.status(502).send('Proxy error');
    }
});

app.listen(PORT, () => {
    console.log(`\n  🧟 PZ Roleplay Panel running at http://localhost:${PORT}\n`);
});
