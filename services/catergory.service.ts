import prisma from '../lib/prisma.js';
import {asyncHandler} from '../utils/asyncHandler.ts';

export const getAllCategories =async () => {
    return await prisma.category.findMany({
        include: {
            children: true,
            promotions: {
                include: {
                    promotion: true
                }
            }
        },
        orderBy: {
            displayOrder: 'asc'
        }
    })
}

export const getCategoryById = async (id: string) => {
    return await prisma.category.findUnique({
        where: { id },
        include: {
            children: true,
            parent: true,
            promotions: {
                include: {
                    promotion: true
                }
            }
        }
    })
}

export const createCategory = async (data: any) => {
    return await prisma.category.create({
        data,
        include: {
            children: true,
            parent: true,
            promotions: true        
        }
    })
}

export const updateCategory = async (id: string, data: any) => {
    return await prisma.category.update({
        where: { id },
        data,
        include: {
            children: true,
            parent: true,
            promotions: true        
        }
    })
}

export const deleteCategory = async (id : string) => {
    return await prisma.category.delete({
        where: { id },
    })
}