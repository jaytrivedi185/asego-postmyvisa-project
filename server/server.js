const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();

// 1. RENDER FIX: Required for cloud load balancers
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;
const TARGET = process.env.TARGET || 'https://dolphin.asego.in';

// 2. CORS
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

// Basic Logging (Safe, doesn't touch the body)
app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.url}`);
  next();
});

// 3. THE DUMB PIPE PROXY
// CRITICAL: This is mounted BEFORE any body parsers. Node will not touch the payload.
const proxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  secure: false,
  
  onProxyReq: (proxyReq, req, res) => {
    // Strip standard browser headers
    proxyReq.removeHeader('origin');
    proxyReq.removeHeader('referer');
    proxyReq.removeHeader('sec-ch-ua');
    proxyReq.removeHeader('sec-ch-ua-mobile');
    proxyReq.removeHeader('sec-ch-ua-platform');
    proxyReq.removeHeader('sec-fetch-dest');
    proxyReq.removeHeader('sec-fetch-mode');
    proxyReq.removeHeader('sec-fetch-site');
    
    // CRITICAL FIX: Strip Render's cloud tracking headers that crash ASEGO's database logs
    proxyReq.removeHeader('x-forwarded-for');
    proxyReq.removeHeader('x-forwarded-proto');
    proxyReq.removeHeader('x-forwarded-host');
    proxyReq.removeHeader('x-real-ip');
    
    proxyReq.setHeader('User-Agent', 'ASEGO-Partner-Client/1.0');
  },
  
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[ASEGO RESPONSE] Status: ${proxyRes.statusCode}`);
  },
  
  onError: (err, req, res) => {
    console.error('[PROXY ERROR]:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Proxy Error', message: err.message });
    }
  }
});

// Attach proxy FIRST
app.use('/api', proxy);

// 4. BODY PARSERS (For local routes only)
// Because the proxy is above this, these parsers will NEVER touch the ASEGO requests.
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', target: TARGET });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  ASEGO PROXY RUNNING (DUMB PIPE MODE)`);
  console.log(`========================================`);
  console.log(`Port: ${PORT}`);
  console.log(`========================================\n`);
});