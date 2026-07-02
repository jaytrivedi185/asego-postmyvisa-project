const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();

// 1. RENDER FIX: This is the ONLY thing your original code was missing for production
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

// 3. PARSERS (Restoring your original setup)
// We MUST use express.text so your encrypted string isn't destroyed
app.use(express.json());
app.use(express.text({ type: 'text/plain', limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.url}`);
  next();
});

// 4. PROXY CONFIGURATION
const proxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  secure: false,
  
  onProxyReq: (proxyReq, req, res) => {
    // Strip headers
    proxyReq.removeHeader('origin');
    proxyReq.removeHeader('referer');
    proxyReq.removeHeader('sec-ch-ua');
    proxyReq.removeHeader('sec-ch-ua-mobile');
    proxyReq.removeHeader('sec-ch-ua-platform');
    proxyReq.removeHeader('sec-fetch-dest');
    proxyReq.removeHeader('sec-fetch-mode');
    proxyReq.removeHeader('sec-fetch-site');
    
    proxyReq.setHeader('User-Agent', 'ASEGO-Partner-Client/1.0');

    // REINSTATING YOUR ORIGINAL WORKING LOGIC
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      let bodyData;
      
      // If your frontend sends the encrypted string as text/plain, pass it EXACTLY as is
      if (req.headers['content-type'] === 'text/plain') {
        bodyData = req.body;
        proxyReq.setHeader('Content-Type', 'text/plain');
        proxyReq.setHeader('Accept', 'text/plain, application/json');
      } else {
        // Fallback for standard JSON (like getting plans)
        bodyData = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Accept', 'application/json');
      }
      
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
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

app.use('/api', proxy);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', target: TARGET });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  ASEGO PROXY RUNNING (ENCRYPTION SAFE)`);
  console.log(`========================================`);
  console.log(`Port: ${PORT}`);
  console.log(`========================================\n`);
});