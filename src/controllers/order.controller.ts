import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import prisma from "../lib/prisma";

// GET /orders
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany();

  res.status(200).json(new ApiResponse(200, orders, "Orders fetched"));
});
