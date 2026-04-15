/**
 * Custom error classes
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * Validation helpers
 */
export const validators = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  isNonEmptyString: (str) => {
    return typeof str === 'string' && str.trim().length > 0;
  },

  isValidScore: (score) => {
    return typeof score === 'number' && score >= 0 && score <= 10;
  },

  isValidQuestionNumber: (num) => {
    return typeof num === 'number' && num >= 1 && num <= 10;
  },
};

/**
 * Validation middleware creator
 */
export function createValidator(schema) {
  return (data) => {
    const errors = [];

    Object.keys(schema).forEach(field => {
      const rules = schema[field];
      const value = data[field];

      rules.forEach(rule => {
        if (!rule(value)) {
          errors.push(`Validation failed for field: ${field}`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };
}

/**
 * Response formatter
 */
export const response = {
  success: (data, message = 'Success', statusCode = 200) => ({
    success: true,
    statusCode,
    message,
    data,
  }),

  error: (message, statusCode = 500, errors = []) => ({
    success: false,
    statusCode,
    message,
    errors,
  }),

  paginated: (data, page, pageSize, total) => ({
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
    },
  }),
};

export default {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  validators,
  createValidator,
  response,
};
