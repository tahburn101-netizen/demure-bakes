const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Proxy API requests to the backend
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(503).json({ error: 'Backend service unavailable' });
  }
}));

// Proxy uploaded media requests to the backend. Product and gallery images live
// in the backend service, while the frontend service only serves the compiled app.
app.use('/uploads', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/uploads': '/uploads'
  },
  onError: (err, req, res) => {
    console.error('Uploads proxy error:', err);
    res.status(503).send('Media unavailable');
  }
}));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Demure Bakes frontend running on port ${PORT}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
});
