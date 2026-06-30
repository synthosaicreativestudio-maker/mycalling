const http = require('http');
const https = require('https');

const PORT = 8888;

http.createServer((req, res) => {
  console.log(`[Proxy Request] ${req.method} ${req.url}`);

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'api.telegram.org'
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);

  proxyReq.on('error', (e) => {
    console.error('[Proxy Error]:', e);
    res.statusCode = 500;
    res.end();
  });
}).listen(PORT, () => {
  console.log(`Telegram Proxy Server running on port ${PORT}`);
});
