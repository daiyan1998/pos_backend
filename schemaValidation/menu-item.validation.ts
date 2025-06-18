import { z } from 'zod';

// Validation schema for creating a menu item
export const createMenuItemSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string"
    }).min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),

    description: z.string({
        invalid_type_error: "Description must be a string"
    }).max(500, "Description must not exceed 500 characters")
      .optional(),

    basePrice: z.number({
        required_error: "Base price is required",
        invalid_type_error: "Base price must be a number"
    }).positive("Base price must be a positive number")
      .min(0.01, "Base price must be at least 0.01"),

    categoryId: z.string({
        required_error: "Category ID is required",
        invalid_type_error: "Category ID must be a string"
    }).uuid("Invalid category ID format"),

    imageUrl: z.string({
        invalid_type_error: "Image URL must be a string"
    }).url("Invalid image URL format")
      .optional(),

    isAvailable: z.boolean({
        invalid_type_error: "isAvailable must be a boolean"
    }).optional().default(true),

    isActive: z.boolean({
        invalid_type_error: "isActive must be a boolean"
    }).optional().default(true)
});

// Validation schema for updating a menu item
export const updateMenuItemSchema = createMenuItemSchema.partial();

// Type inference
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>; 