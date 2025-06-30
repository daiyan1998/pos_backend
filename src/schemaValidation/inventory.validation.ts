import { z } from 'zod';

export const inventoryValidation = {
  create: z.object({
    menuItemId: z.string().uuid(),
    currentStock: z.number().int(),
    minStock: z.number().int(),
    maxStock: z.number().int().optional(),
    unit: z.string(),
    isActive: z.boolean().optional(),
  }),
  update: z.object({
    currentStock: z.number().int().optional(),
    minStock: z.number().int().optional(),
    maxStock: z.number().int().optional(),
    unit: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
}; 