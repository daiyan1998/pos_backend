import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import prisma from '../lib/prisma';

// fix: run npx prisma generate to generate the prisma client

// GET /tables
export const getTables = asyncHandler(async (req: Request, res: Response) => {
    const tables = await prisma.table.findMany({
        include: {
            creator: true,
            orders: true
        }
    });

    res.status(200).json(
        new ApiResponse(200, tables, 'Tables fetched successfully')
    );
});

// POST /tables
export const createTable = asyncHandler(async (req: Request, res: Response) => {
    const { tableNumber, capacity, location } = req.body;
    
    // Create table data object
    const tableData: any = {
        tableNumber,
        capacity,
        location
    };
    
    // Only add createdBy if user is authenticated
    if (req.user && req.user.id) {
        tableData.createdBy = req.user.id;
    }
    
    const table = await prisma.table.create({
        data: tableData
    });
    res.status(201).json(
        new ApiResponse(201, table, 'Table created successfully')
    );
});

// PUT /tables/:id/status
export const updateTableStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!req.user || !req.user.id) {
        return res.status(401).json(new ApiResponse(401, null, 'Unauthorized'));
    }
    const table = await prisma.table.update({
        where: { id },
        data: { status }
    });
    res.status(200).json(
        new ApiResponse(200, table, 'Table status updated successfully')
    );
}); 

// DELETE /tables/:id
export const deleteTable = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const table = await prisma.table.delete({
        where: { id }
    });
    res.status(200).json(
        new ApiResponse(200, table, 'Table deleted successfully')
    );
});