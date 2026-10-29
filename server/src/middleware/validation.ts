import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Recursively sanitizes string values in an object using DOMPurify
 */
function sanitizeObject<T>(input: T): T {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input.trim()) as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeObject(item)) as unknown as T;
  }
  if (input !== null && typeof input === 'object') {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj;
  }
  return input;
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      const parsed = schema.parse(sanitizedBody);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
        return;
      }
      res.status(400).json({ error: 'Malformed request payload' });
    }
  };
}

