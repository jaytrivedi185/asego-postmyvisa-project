require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const crypto = require('crypto');
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
  if (!origin) return true;
  return allowedOrigins.includes(origin) ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.startsWith('https://localhost:') ||
    origin.startsWith('https://127.0.0.1:');
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

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
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
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
      

    }
  },
  
  onProxyRes: (proxyRes, req, res) => {},
  
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

// ── PayU Response Relay Endpoints ───────────────────────────────────────────
// PayU POSTs to surl/furl — we convert POST body to GET redirect so the React
// frontend (SPA) can read the params from window.location.search
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

app.post('/payu/success', (req, res) => {
  const params = new URLSearchParams(req.body).toString();
  res.redirect(`${FRONTEND_BASE_URL}/payment-success?${params}`);
});

app.post('/payu/failure', (req, res) => {
  const params = new URLSearchParams(req.body).toString();
  res.redirect(`${FRONTEND_BASE_URL}/payment-failure?${params}`);
});

// ── PayU Hash Generation Endpoint ────────────────────────────────────────────
// PayU hash formula: SHA512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)
app.post('/payu/hash', (req, res) => {
  const salt = process.env.PAYU_MERCHANT_SALT;
  const key  = process.env.PAYU_MERCHANT_KEY;

  if (!salt || !key) {
    return res.status(500).json({ message: 'PayU credentials not configured on server.' });
  }

  const { txnid, amount, productinfo, firstname, email } = req.body;

  if (!txnid || !amount || !productinfo || !firstname || !email) {
    return res.status(400).json({ message: 'Missing required hash fields.' });
  }

  // PayU hash string: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  res.json({ hash });
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
