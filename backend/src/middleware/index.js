import { AppError, response } from '../utils/errors.js';

/**
 * Error handling middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
  });

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  res.status(statusCode).json(
    response.error(message, statusCode, err.isOperational ? [] : ['An unexpected error occurred'])
  );
}

/**
 * 404 not found middleware
 */
export function notFoundHandler(req, res) {
  res.status(404).json(
    response.error(`Route ${req.originalUrl} not found`, 404)
  );
}

/**
 * Async route wrapper
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Request logging middleware
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
}

/**
 * CORS middleware wrapper
 */
export function corsOptions(corsLib) {
  return corsLib({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}

/**
 * Request validation middleware
 */
export function validateRequest(schema) {
  return (req, res, next) => {
    const errors = [];

    Object.keys(schema).forEach(field => {
      const rules = schema[field];
      const value = req.body[field] ?? req.params[field] ?? req.query[field];

      rules.forEach(rule => {
        if (!rule(value)) {
          errors.push(`Validation failed: ${field}`);
        }
      });
    });

    if (errors.length > 0) {
      return res.status(400).json(response.error('Validation failed', 400, errors));
    }

    next();
  };
}

/**
 * Rate limiting middleware (basic in-memory)
 */
export function createRateLimiter(maxRequests = 100, windowMs = 60000) {
  const store = {};

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    if (!store[key]) {
      store[key] = [];
    }

    // Remove old requests outside the window
    store[key] = store[key].filter(time => now - time < windowMs);

    if (store[key].length >= maxRequests) {
      return res.status(429).json(response.error('Too many requests', 429));
    }

    store[key].push(now);
    next();
  };
}

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  requestLogger,
  corsOptions,
  validateRequest,
  createRateLimiter,
};
