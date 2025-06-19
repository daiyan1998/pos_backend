import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import prisma from '../lib/prisma.ts';


// Get all menu items
export const getMenuItems = asyncHandler(async (req: Request, res: Response) => {
    const menuItems = await prisma.menuItem.findMany({
        include: {
            category: true,
            variants: true
        }
    });
    
    res.status(200).json(
        new ApiResponse(200, menuItems, "Menu items retrieved successfully")
    );
});

// Create a new menu item
export const createMenuItem = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, basePrice, categoryId, imageUrl } = req.body;

    const menuItem = await prisma.menuItem.create({
        data: {
            name,
            description,
            basePrice,
            categoryId,
            imageUrl
        },
        include: {
            category: true
        }
    });

    res.status(201).json(
        new ApiResponse(201, menuItem, "Menu item created successfully")
    );
});

// Get menu item by ID
export const getMenuItemById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
        where: { id },
        include: {
            category: true,
            variants: true
        }
    });

    if (!menuItem) {
        return res.status(404).json(
            new ApiResponse(404, null, "Menu item not found")
        );
    }

    res.status(200).json(
        new ApiResponse(200, menuItem, "Menu item retrieved successfully")
    );
});

// Update menu item
export const updateMenuItem = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, basePrice, categoryId, imageUrl } = req.body;

    const menuItem = await prisma.menuItem.update({
        where: { id },
        data: {
            name,
            description,
            basePrice,
            categoryId,
            imageUrl
        },
        include: {
            category: true
        }
    });

    res.status(200).json(
        new ApiResponse(200, menuItem, "Menu item updated successfully")
    );
});

// Delete menu item
export const deleteMenuItem = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.menuItem.delete({
        where: { id }
    });

    res.status(200).json(
        new ApiResponse(200, null, "Menu item deleted successfully")
    );
});

// Get menu item variants
export const getMenuItemVariants = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const variants = await prisma.menuVariant.findMany({
        where: { menuItemId: id }
    });

    res.status(200).json(
        new ApiResponse(200, variants, "Menu item variants retrieved successfully")
    );
});

// Create a new menu item variant
export const createMenuItemVariant = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // menuItemId
    const { name, description, priceAdd, isActive } = req.body;

    const variant = await prisma.menuVariant.create({
        data: {
            name,
            description,
            priceAdd,
            isActive,
            menuItemId: id
        }
    });

    res.status(201).json(
        new ApiResponse(201, variant, "Menu item variant created successfully")
    );
});

// Update a menu item variant
export const updateMenuItemVariant = asyncHandler(async (req: Request, res: Response) => {
    const { id, variantId } = req.params;
    const { name, description, priceAdd, isActive } = req.body;

    // Optionally, check if the variant belongs to the menu item
    const variant = await prisma.menuVariant.update({
        where: { id: variantId },
        data: {
            name,
            description,
            priceAdd,
            isActive
        }
    });

    res.status(200).json(
        new ApiResponse(200, variant, "Menu item variant updated successfully")
    );
});

// Delete a menu item variant
export const deleteMenuItemVariant = asyncHandler(async (req: Request, res: Response) => {
    const { id, variantId } = req.params;

    await prisma.menuVariant.delete({
        where: { id: variantId }
    });

    res.status(200).json(
        new ApiResponse(200, null, "Menu item variant deleted successfully")
    );
}); 