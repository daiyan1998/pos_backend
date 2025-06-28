import express from "express";
import { getOrders } from "../controllers/order.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = express.Router();

// GET /orders, Post /orders
router.route("/").get(getOrders);

export default router;
