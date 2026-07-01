const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const TARGET = process.env.TARGET || 'https://dolphin.asego.in';

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://insurance.postmyvisa.com',
  'https://www.insurance.postmyvisa.com',
];

const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...configuredOrigins]));

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow non-browser clients (like Postman)
  return allowedOrigins.includes(origin) ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.startsWith('https://localhost:') ||
    origin.startsWith('https://127.0.0.1:');
};

// 1. Clean, single CORS implementation
app.use(cors({
  origin: function (origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 2. PROXY CONFIGURATION (Must be defined BEFORE body parsers)
const proxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  secure: false,
  
  onProxyReq: (proxyReq, req, res) => {
    // Remove browser-specific headers that cause CORS/Security issues at the target
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

    // Notice we DO NOT manually write the body here anymore.
    // Because express.json() hasn't consumed the stream yet, 
    // the proxy will natively pass the raw payload exactly as Swagger does.
  },
  
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Response from ASEGO: ${proxyRes.statusCode}`);
  },
  
  onError: (err, req, res) => {
    console.error('Proxy Error:', err.message);
    res.status(500).json({
      error: 'Proxy Error',
      message: err.message
    });
  }
});

// 3. Attach proxy to /api route FIRST
app.use('/api', proxy);

// 4. Attach body parsers AFTER the proxy 
// (This ensures local routes like /health can parse JSON, but the proxy is untouched)
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', target: TARGET });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  ASEGO API Proxy Server Running`);
  console.log(`========================================`);
  console.log(`Proxy URL: http://0.0.0.0:${PORT}`);
  console.log(`Target API: ${TARGET}`);
  console.log(`CORS Enabled: ${allowedOrigins.join(', ')}`);
  console.log(`========================================\n`);
});