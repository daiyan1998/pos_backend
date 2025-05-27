import { Request, Response} from 'express'
import * as categoryService from "../services/catergory.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponse} from '../utils/ApiResponse.js'

export const getCategories = asyncHandler(async (req : Request, res : Response) => {
    const categories =  categoryService.getAllCategories()

    res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
})

export const createCategory = asyncHandler(async ( req : Request, res : Response) => {
    const { name, description, displayOrder, parentId } = req.body;

    const category =  categoryService.createCategory({
        name,
        description,
        displayOrder,
        parentId
    });
    res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    );
})

export const getCategoryById = asyncHandler(async ( req : Request, res : Response) => {
    const { id } = req.params;

    const category =  categoryService.getCategoryById(id);

    res.status(200).json(
        new ApiResponse(200, category, "Category fetched successfully")
    );
})

export const updateCategory = asyncHandler(async ( req : Request, res : Response) => {
    const { id } = req.params;
    const { name, description, displayOrder, parentId } = req.body;

    const category =  categoryService.updateCategory(id, {
        name,
        description,
        displayOrder,
        parentId
    });

    res.status(200).json(
        new ApiResponse(200, category, "Category updated successfully")
    );
})

export const deleteCategory = asyncHandler(async ( req : Request, res : Response) => {
    const { id } = req.params;

    const category =  categoryService.deleteCategory(id);

    res.status(200).json(
        new ApiResponse(200, category, "Category deleted successfully")
    );
})