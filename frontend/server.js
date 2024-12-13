const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Set CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: chrome-extension:; " +
    "connect-src 'self' http://127.0.0.1:8545 ws://127.0.0.1:8545 ws://localhost:8545; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https:; " +
    "frame-src 'self' chrome-extension:; " +
    "worker-src 'self' blob:;"
  );
  next();
});

// Enable CORS for development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// API endpoints can be added here
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`CSP and CORS headers enabled`);
  console.log(`Serving React app from ${path.join(__dirname, 'build')}`);
});
