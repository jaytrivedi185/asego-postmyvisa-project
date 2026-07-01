const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();

// 1. Trust Render's Load Balancer
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;
const TARGET = process.env.TARGET || 'https://dolphin.asego.in';

// 2. CORS Configuration (Simplified and Safe)
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

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
}));

// 3. Body Parsers (MUST be placed BEFORE the proxy for fixRequestBody to work)
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

// Logging to ensure the server is receiving the request
app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.url}`);
  next();
});

// 4. Proxy Middleware Configuration
const proxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  secure: false,
  
  onProxyReq: (proxyReq, req, res) => {
    // Strip security headers causing CORS drops at the destination
    proxyReq.removeHeader('origin');
    proxyReq.removeHeader('referer');
    proxyReq.removeHeader('sec-ch-ua');
    proxyReq.removeHeader('sec-ch-ua-mobile');
    proxyReq.removeHeader('sec-ch-ua-platform');
    proxyReq.removeHeader('sec-fetch-dest');
    proxyReq.removeHeader('sec-fetch-mode');
    proxyReq.removeHeader('sec-fetch-site');
    
    proxyReq.setHeader('Accept', 'application/json');
    proxyReq.setHeader('User-Agent', 'ASEGO-Partner-Client/1.0');

    // THIS IS THE FIX FOR RENDER CORRUPTING THE POST BODY
    // If there is a body, safely reconstruct it for the Java backend
    if (req.body && Object.keys(req.body).length > 0) {
        fixRequestBody(proxyReq, req);
    }
  },
  
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[RESPONSE] ASEGO returned status: ${proxyRes.statusCode}`);
  },
  
  onError: (err, req, res) => {
    console.error('[PROXY ERROR]:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Proxy Error', message: err.message });
    }
  }
});

// Attach proxy to API routes
app.use('/api', proxy);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', target: TARGET });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  ASEGO PROXY RESTARTED (STABLE)`);
  console.log(`========================================`);
  console.log(`Port: ${PORT}`);
  console.log(`Target: ${TARGET}`);
  console.log(`========================================\n`);
});