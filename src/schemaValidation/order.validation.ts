import { z } from 'zod';

// Validation schema for creating a new order
export const createOrderSchema = z.object({
  tableId: z.string({
    invalid_type_error: "Table ID must be a string"
  }).uuid("Invalid table ID format").optional(),

  orderType: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"], {
    required_error: "Order type is required",
    invalid_type_error: "Order type must be DINE_IN, TAKEAWAY, or DELIVERY"
  }),

  customerName: z.string({
    invalid_type_error: "Customer name must be a string"
  }).min(1, "Customer name is required").optional(),

  customerPhone: z.string({
    invalid_type_error: "Customer phone must be a string"
  }).optional(),

  notes: z.string({
    invalid_type_error: "Notes must be a string"
  }).optional(),

  orderItems: z.array(z.object({
    menuItemId: z.string({
      required_error: "Menu item ID is required",
      invalid_type_error: "Menu item ID must be a string"
    }).uuid("Invalid menu item ID format"),

    variantId: z.string({
      invalid_type_error: "Variant ID must be a string"
    }).uuid("Invalid variant ID format").optional(),

    quantity: z.number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number"
    }).int("Quantity must be an integer").positive("Quantity must be positive").min(1, "Quantity must be at least 1"),

    notes: z.string({
      invalid_type_error: "Item notes must be a string"
    }).optional()
  })).min(1, "At least one item is required")
});

// Validation schema for adding items to an existing order
export const addOrderItemsSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string({
      required_error: "Menu item ID is required",
      invalid_type_error: "Menu item ID must be a string"
    }).uuid("Invalid menu item ID format"),

    variantId: z.string({
      invalid_type_error: "Variant ID must be a string"
    }).uuid("Invalid variant ID format").optional(),

    quantity: z.number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number"
    }).int("Quantity must be an integer").positive("Quantity must be positive").min(1, "Quantity must be at least 1"),

    notes: z.string({
      invalid_type_error: "Item notes must be a string"
    }).optional()
  })).min(1, "At least one item is required")
});

// Validation schema for updating order status
export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PREPARATION", "READY", "SERVED", "CANCELLED"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be PENDING, IN_PREPARATION, READY, SERVED, or CANCELLED"
  })
});

// Validation schema for KOT printing
export const printKOTSchema = z.object({
  printAllItems: z.boolean({
    invalid_type_error: "printAllItems must be a boolean"
  }).optional().default(false)
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AddOrderItemsInput = z.infer<typeof addOrderItemsSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type PrintKOTInput = z.infer<typeof printKOTSchema>; 