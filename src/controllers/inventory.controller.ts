import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

// Create Inventory Item
export const createInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.inventoryItem.create({ data: req.body });
  res.status(201).json(new ApiResponse(201, item, 'Inventory item created'));
});

// Get all Inventory Items
export const getAllInventoryItems = asyncHandler(async (req: Request, res: Response) => {
  const items = await prisma.inventoryItem.findMany();
  res.json(new ApiResponse(200, items));
});

// Get Inventory Item by ID
export const getInventoryItemById = asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.inventoryItem.findUnique({ where: { id: req.params.id } });
  if (!item) throw new ApiError(404, 'Inventory item not found');
  res.json(new ApiResponse(200, item));
});

// Update Inventory Item
export const updateInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.inventoryItem.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(new ApiResponse(200, item, 'Inventory item updated'));
});

// Delete Inventory Item
export const deleteInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  await prisma.inventoryItem.delete({ where: { id: req.params.id } });
  res.json(new ApiResponse(200, null, 'Inventory item deleted'));
}); 