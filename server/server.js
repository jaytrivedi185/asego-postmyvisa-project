const express = require('express');
const cors = require('cors');
const app = express();

// Trust Render's load balancer
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;
const TARGET = process.env.TARGET || 'https://dolphin.asego.in';

// 1. CORS Configuration
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

// 2. PARSE THE BODY NATIVELY
// We parse the body into a perfect JS object before doing anything else.
app.use(express.json());
app.use(express.text());

// 3. MANUAL FETCH PROXY
app.all('/api/*', async (req, res) => {
  try {
    // Strip /api and append to target (e.g., /api/create -> https://dolphin.asego.in/create)
    const targetPath = req.originalUrl.replace(/^\/api/, '');
    const targetUrl = `${TARGET}${targetPath}`;

    console.log(`[PROXYING] ${req.method} to ${targetUrl}`);

    // Create a fresh, clean set of headers
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'ASEGO-Partner-Client/1.0',
    };

    // Forward Authorization header if your frontend sends it
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const fetchOptions = {
      method: req.method,
      headers: headers,
    };

    // Safely attach the body for requests that need it
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      // If it's already an object, stringify it. If it's text, pass it as is.
      fetchOptions.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
      console.log(`[PAYLOAD] Sending data size:`, Buffer.byteLength(fetchOptions.body));
    }

    // Shoot the request to the Java backend
    const asegoResponse = await fetch(targetUrl, fetchOptions);

    // Get raw text response to prevent JSON parsing crashes on HTML error pages
    const responseData = await asegoResponse.text();

    console.log(`[RESPONSE] ASEGO returned ${asegoResponse.status}`);

    // Forward the exact status and data back to your frontend
    res.status(asegoResponse.status).send(responseData);

  } catch (error) {
    console.error('[PROXY ERROR]:', error.message);
    res.status(500).json({ error: 'Manual Proxy Error', message: error.message });
  }
});

// 4. Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', target: TARGET, mode: 'manual-fetch' });
});

// 5. Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  MANUAL FETCH PROXY RUNNING (RENDER)`);
  console.log(`========================================`);
  console.log(`Port: ${PORT}`);
  console.log(`Target: ${TARGET}`);
  console.log(`========================================\n`);
});