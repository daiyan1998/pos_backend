import express from 'express'
import { getCategories,createCategory, deleteCategory, getCategoryById, updateCategory } from '../controllers/category.controller.js'

const router = express.Router()

// GET & POST /api/v1/categories 
router.route('/').get(getCategories).post(createCategory)

// GET, PUT & DELETE /api/v1/categories/:id
router.route('/:id').get(getCategoryById).put(updateCategory).delete(deleteCategory)

export default router