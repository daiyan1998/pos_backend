import { z } from 'zod';

export const createMenuVariantSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string"
    }).min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),

    description: z.string({
        invalid_type_error: "Description must be a string"
    }).max(500, "Description must not exceed 500 characters")
      .optional(),

    priceAdd: z.number({
        required_error: "Price add is required",
        invalid_type_error: "Price add must be a number"
    }).min(0, "Price add must be at least 0"),

    isActive: z.boolean({
        invalid_type_error: "isActive must be a boolean"
    }).optional().default(true)
});

export const updateMenuVariantSchema = createMenuVariantSchema.partial();

export type CreateMenuVariantInput = z.infer<typeof createMenuVariantSchema>;
export type UpdateMenuVariantInput = z.infer<typeof updateMenuVariantSchema>;
