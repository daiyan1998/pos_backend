import express from "express";
import { 
  getOrders, 
  getOrderById, 
  createOrder, 
  addOrderItems, 
  updateOrderStatus, 
  printKOT 
} from "../controllers/order.controller";
import { verifyJWT } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validateRequest";
import { 
  createOrderSchema, 
  addOrderItemsSchema, 
  updateOrderStatusSchema, 
  printKOTSchema 
} from "../schemaValidation/order.validation";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// GET /orders - Get all orders with optional filters
router.get("/", getOrders);

// GET /orders/:id - Get order by ID
router.get("/:id", getOrderById);

// POST /orders - Create new order
router.post("/", validateRequest(createOrderSchema), createOrder);

// PUT /orders/:id/items - Add items to existing order
router.put("/:id/items", validateRequest(addOrderItemsSchema), addOrderItems);

// PUT /orders/:id/status - Update order status
router.put("/:id/status", validateRequest(updateOrderStatusSchema), updateOrderStatus);


// WIP : KOT printing
// POST /orders/:id/kot - Print KOT
router.post("/:id/kot", validateRequest(printKOTSchema), printKOT);

export default router;
