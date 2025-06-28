import { Request, Response} from 'express'
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponse} from '../utils/ApiResponse.js'
import prisma from '../lib/prisma';

export const getCategories = asyncHandler(async (req : Request, res : Response) => {
    const categories = await prisma.category.findMany();

    res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
})

export const createCategory = asyncHandler(async ( req : Request, res : Response) => {
    const { name, description, sortOrder } = req.body;

    const category = await prisma.category.create({
        data: {
            name,
            description,
            sortOrder,
        }
    });
    res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    );
})

export const getCategoryById = asyncHandler(async ( req : Request, res : Response) => {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
        where: {
            id
        }
    });

    res.status(200).json(
        new ApiResponse(200, category, "Category fetched successfully")
    );
})

export const updateCategory = asyncHandler(async ( req : Request, res : Response) => {
    const { id } = req.params;
    const { name, description, sortOrder } = req.body;

    const category = await prisma.category.update({
        where: {
            id
        },
        data: {
        name,
        description,
        sortOrder,
        }
    });

    res.status(200).json(
        new ApiResponse(200, category, "Category updated successfully")
    );
})

export const deleteCategory = asyncHandler(async ( req : Request, res : Response) => {
    const { id } = req.params;

    const category = await prisma.category.delete({
        where: {
            id
        }
    });

    res.status(200).json(
        new ApiResponse(200, category, "Category deleted successfully")
    );
})