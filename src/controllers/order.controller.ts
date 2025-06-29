import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import prisma from "../lib/prisma";
import { CreateOrderInput, AddOrderItemsInput, UpdateOrderStatusInput, PrintKOTInput } from "../schemaValidation/order.validation.js";

// Helper function to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// Helper function to calculate order totals
const calculateOrderTotals = (orderItems: Array<{ totalPrice: number | string | any }>) => {
  const totalAmount = orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
  const taxAmount = totalAmount * 0.1; // 10% tax
  const serviceCharge = totalAmount * 0.05; // 5% service charge
  const discountAmount = 0; // Default discount
  const finalAmount = totalAmount + taxAmount + serviceCharge - discountAmount;

  return {
    totalAmount,
    taxAmount,
    serviceCharge,
    discountAmount,
    finalAmount
  };
};

// Type for order item data
interface OrderItemData {
  menuItemId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

// GET /orders
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, orderType, tableId } = req.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (orderType) {
    where.orderType = orderType;
  }

  if (tableId) {
    where.tableId = tableId;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      orderItems: {
        include: {
          menuItem: true,
          variant: true
        }
      },
      table: true,
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// GET /orders/:id
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: {
          menuItem: true,
          variant: true
        }
      },
      table: true,
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true
        }
      }
    }
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

// POST /orders
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const orderData: CreateOrderInput = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  // Validate table availability if tableId is provided
  if (orderData.tableId) {
    const table = await prisma.table.findUnique({
      where: { id: orderData.tableId }
    });

    if (!table) {
      throw new ApiError(404, "Table not found");
    }

    if (table.status !== "AVAILABLE") {
      throw new ApiError(400, "Table is not available");
    }
  }

  // Validate menu items and calculate prices
  const orderItems: OrderItemData[] = [];
  for (const item of orderData.orderItems) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: item.menuItemId },
      include: {
        variants: true
      }
    });

    if (!menuItem) {
      throw new ApiError(404, `Menu item with ID ${item.menuItemId} not found`);
    }

    if (!menuItem.isAvailable || !menuItem.isActive) {
      throw new ApiError(400, `Menu item ${menuItem.name} is not available`);
    }

    let unitPrice = Number(menuItem.basePrice);
    let variant = null;

    if (item.variantId) {
      variant = menuItem.variants.find(v => v.id === item.variantId);
      if (!variant) {
        throw new ApiError(404, `Variant with ID ${item.variantId} not found for menu item ${menuItem.name}`);
      }
      unitPrice += Number(variant.priceAdd);
    }

    const totalPrice = unitPrice * item.quantity;

    orderItems.push({
      menuItemId: item.menuItemId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      notes: item.notes
    });
  }

  const totals = calculateOrderTotals(orderItems);

  // Create order with items in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        tableId: orderData.tableId,
        orderType: orderData.orderType,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        notes: orderData.notes,
        totalAmount: totals.totalAmount,
        taxAmount: totals.taxAmount,
        serviceCharge: totals.serviceCharge,
        discountAmount: totals.discountAmount,
        finalAmount: totals.finalAmount,
        createdBy: userId
      }
    });

    // Create order items
    await tx.orderItem.createMany({
      data: orderItems.map(item => ({
        orderId: newOrder.id,
        ...item
      }))
    });

    // Update table status if table is assigned
    if (orderData.tableId) {
      await tx.table.update({
        where: { id: orderData.tableId },
        data: { status: "OCCUPIED" }
      });
    }

    return newOrder;
  });

  // Fetch the complete order with items
  const completeOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      orderItems: {
        include: {
          menuItem: true,
          variant: true
        }
      },
      table: true,
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true
        }
      }
    }
  });

  res.status(201).json(new ApiResponse(201, completeOrder, "Order created successfully"));
});

// PUT /orders/:id/items
export const addOrderItems = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const itemsData: AddOrderItemsInput = req.body;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true
    }
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status === "CANCELLED") {
    throw new ApiError(400, "Cannot add items to a cancelled order");
  }

  // Validate menu items and calculate prices
  const newOrderItems: OrderItemData[] = [];
  for (const item of itemsData.items) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: item.menuItemId },
      include: {
        variants: true
      }
    });

    if (!menuItem) {
      throw new ApiError(404, `Menu item with ID ${item.menuItemId} not found`);
    }

    if (!menuItem.isAvailable || !menuItem.isActive) {
      throw new ApiError(400, `Menu item ${menuItem.name} is not available`);
    }

    let unitPrice = Number(menuItem.basePrice);
    let variant = null;

    if (item.variantId) {
      variant = menuItem.variants.find(v => v.id === item.variantId);
      if (!variant) {
        throw new ApiError(404, `Variant with ID ${item.variantId} not found for menu item ${menuItem.name}`);
      }
      unitPrice += Number(variant.priceAdd);
    }

    const totalPrice = unitPrice * item.quantity;

    newOrderItems.push({
      menuItemId: item.menuItemId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      notes: item.notes
    });
  }

  // Add items and recalculate totals in a transaction
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Create new order items
    await tx.orderItem.createMany({
      data: newOrderItems.map(item => ({
        orderId: id,
        ...item
      }))
    });

    // Get all order items to recalculate totals
    const allOrderItems = await tx.orderItem.findMany({
      where: { orderId: id }
    });

    const totals = calculateOrderTotals(allOrderItems);

    // Update order totals
    const updatedOrder = await tx.order.update({
      where: { id },
      data: {
        totalAmount: totals.totalAmount,
        taxAmount: totals.taxAmount,
        serviceCharge: totals.serviceCharge,
        discountAmount: totals.discountAmount,
        finalAmount: totals.finalAmount
      }
    });

    return updatedOrder;
  });

  // Fetch the complete updated order
  const completeOrder = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: {
          menuItem: true,
          variant: true
        }
      },
      table: true,
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true
        }
      }
    }
  });

  res.status(200).json(new ApiResponse(200, completeOrder, "Items added to order successfully"));
});

// PUT /orders/:id/status
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status }: UpdateOrderStatusInput = req.body;
  console.log(id, status);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      table: true
    }
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    PENDING: ["IN_PREPARATION", "CANCELLED"],
    IN_PREPARATION: ["READY", "CANCELLED"],
    READY: ["SERVED", "CANCELLED"],
    SERVED: ["CANCELLED"],
    CANCELLED: []
  };

  const allowedTransitions = validTransitions[order.status] || [];
  if (!allowedTransitions.includes(status)) {
    throw new ApiError(400, `Cannot transition from ${order.status} to ${status}`);
  }

  // Update order status
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      orderItems: {
        include: {
          menuItem: true,
          variant: true
        }
      },
      table: true,
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true
        }
      }
    }
  });

  // Update table status if order is completed or cancelled
  if (status === "SERVED" || status === "CANCELLED") {
    if (order.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: "AVAILABLE" }
      });
    }
  }

  res.status(200).json(new ApiResponse(200, updatedOrder, "Order status updated successfully"));
});

// POST /orders/:id/kot
export const printKOT = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { printAllItems }: PrintKOTInput = req.body;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: {
          menuItem: true,
          variant: true
        },
        where: printAllItems ? {} : { status: "PENDING" }
      },
      table: true,
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true
        }
      }
    }
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.orderItems.length === 0) {
    throw new ApiError(400, "No items to print");
  }

  // Update KOT printed status
  await prisma.order.update({
    where: { id },
    data: {
      kotPrinted: true,
      kotPrintedAt: new Date()
    }
  });

  // Prepare KOT data
  const kotData = {
    orderNumber: order.orderNumber,
    tableNumber: order.table?.tableNumber || "N/A",
    customerName: order.customerName || "N/A",
    items: order.orderItems.map(item => ({
      name: item.menuItem.name,
      variant: item.variant?.name || "Standard",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.notes
    })),
    totalAmount: order.totalAmount,
    printedAt: new Date(),
    printedBy: order.creator.username
  };

  res.status(200).json(new ApiResponse(200, kotData, "KOT printed successfully"));
});

