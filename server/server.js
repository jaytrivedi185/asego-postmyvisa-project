const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const TARGET = process.env.TARGET || 'https://dolphin.asego.in';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin) ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.startsWith('https://localhost:') ||
    origin.startsWith('https://127.0.0.1:');
};

// Enable CORS for frontend
app.use(cors({
  origin: function (origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
}));
app.options('*', cors({
  origin: function (origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Proxy configuration
const proxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  secure: false,
  selfHandleResponse: false,
  
  // Modify request before sending to ASEGO API
  onProxyReq: (proxyReq, req, res) => {
    // Remove browser-specific headers that cause CORS issues
    proxyReq.removeHeader('origin');
    proxyReq.removeHeader('referer');
    proxyReq.removeHeader('sec-ch-ua');
    proxyReq.removeHeader('sec-ch-ua-mobile');
    proxyReq.removeHeader('sec-ch-ua-platform');
    proxyReq.removeHeader('sec-fetch-dest');
    proxyReq.removeHeader('sec-fetch-mode');
    proxyReq.removeHeader('sec-fetch-site');
    
    // Set proper headers for ASEGO API
    proxyReq.setHeader('Accept', 'application/json');
    proxyReq.setHeader('User-Agent', 'ASEGO-Partner-Client/1.0');
    
    // Handle request body for POST requests
    if (req.method === 'POST' && req.body) {
      let bodyData;
      
      // Check content type and prepare body accordingly
      if (req.headers['content-type'] === 'application/json') {
        bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
      } else if (req.headers['content-type'] === 'text/plain') {
        bodyData = req.body;
        proxyReq.setHeader('Content-Type', 'text/plain');
      } else {
        bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
      }
      
      // Update content-length
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      
      // Write body to proxy request
      proxyReq.write(bodyData);
      
      console.log('Proxying request body:', bodyData.substring(0, 200));
    }
  },
  
  // Log response from ASEGO API
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Response from ASEGO: ${proxyRes.statusCode}`);
  },
  
  // Handle errors
  onError: (err, req, res) => {
    console.error('Proxy Error:', err.message);
    res.status(500).json({
      error: 'Proxy Error',
      message: err.message
    });
  },
  
  onOpen: (proxySocket) => {
    proxySocket.setTimeout(0);
  },
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', target: TARGET });
});

app.use('/api', proxy);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  ASEGO API Proxy Server Running`);
  console.log(`========================================`);
  console.log(`Proxy URL: http://0.0.0.0:${PORT}`);
  console.log(`Target API: ${TARGET}`);
  console.log(`CORS Enabled: ${allowedOrigins.join(', ')}`);
  console.log(`========================================\n`);
});
