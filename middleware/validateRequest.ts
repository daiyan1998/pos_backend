import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiResponse } from '../utils/ApiResponse.ts';

export const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Validate only the body
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));
                
                res.status(400).json(
                    new ApiResponse(400, { errors }, "Validation failed")
                );
                return;
            }
            
            res.status(500).json(
                new ApiResponse(500, null, "Internal server error")
            );
            return;
        }
    };
}; 