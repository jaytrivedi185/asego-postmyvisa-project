const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();

// 1. RENDER CONFIGURATION: Trust Render's load balancer
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;
const TARGET = process.env.TARGET || 'https://dolphin.asego.in';

// 2. CORS CONFIGURATION
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
  if (!origin) return true; // Allow non-browser clients
  return allowedOrigins.includes(origin) ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.startsWith('https://localhost:') ||
    origin.startsWith('https://127.0.0.1:');
};

app.use(cors({
  origin: function (origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
}));

// Basic request logging (Safe to put before proxy)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 3. PROXY CONFIGURATION
// CRITICAL: This MUST come before express.json() so it streams the raw, untouched body.
const proxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  secure: false, // Set to false to avoid SSL certificate issues between Node and the target
  
  onProxyReq: (proxyReq, req, res) => {
    // Strip browser security headers that cause the Java backend to reject the request
    proxyReq.removeHeader('origin');
    proxyReq.removeHeader('referer');
    proxyReq.removeHeader('sec-ch-ua');
    proxyReq.removeHeader('sec-ch-ua-mobile');
    proxyReq.removeHeader('sec-ch-ua-platform');
    proxyReq.removeHeader('sec-fetch-dest');
    proxyReq.removeHeader('sec-fetch-mode');
    proxyReq.removeHeader('sec-fetch-site');
    
    // Force backend to treat this as a standard API request, just like Swagger
    proxyReq.setHeader('Accept', 'application/json');
    proxyReq.setHeader('User-Agent', 'ASEGO-Partner-Client/1.0');
  },
  
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Response from ASEGO: ${proxyRes.statusCode}`);
  },
  
  onError: (err, req, res) => {
    console.error('Proxy Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Proxy Error',
        message: err.message
      });
    }
  }
});

// Attach proxy to the /api route
app.use('/api', proxy);

// 4. BODY PARSERS
// Placed AFTER the proxy. The proxy handles its own stream. 
// These parsers will only apply to routes defined below this line (like /health).
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

// 5. LOCAL ROUTES
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    target: TARGET,
    environment: 'render' 
  });
});

// 6. SERVER START
// '0.0.0.0' is explicitly required by Render to expose the port correctly
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  ASEGO API Proxy Server Running`);
  console.log(`========================================`);
  console.log(`Proxy URL: http://0.0.0.0:${PORT}`);
  console.log(`Target API: ${TARGET}`);
  console.log(`========================================\n`);
});