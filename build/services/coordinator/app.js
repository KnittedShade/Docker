import express from 'express';

const app = express();
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello from coordinator service!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Version endpoint
app.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'coordinator-service'
  });
});

// Process endpoint with validation
app.post('/process', (req, res) => {
  if (!req.is('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body cannot be empty' });
  }

  res.json({
    status: 'processing',
    receivedData: req.body
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Only start if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Coordinator service listening at http://localhost:${port}`);
  });
}

export default app;