import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  corsOptions,
  createRateLimiter,
} from './middleware/index.js';
import candidateRoutes from './routes/candidates.js';

const app = express();

// Middleware
app.use(requestLogger);
app.use(cors(corsOptions(cors)));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(createRateLimiter(100, 60000)); // 100 requests per minute

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.environment,
  });
});

// API Routes
app.use('/api/candidates', candidateRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   DD IoT Candidate Validator API                      ║
║   🚀 Server running on http://localhost:${PORT}       ║
║   📦 Environment: ${config.environment.toUpperCase().padEnd(20)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
