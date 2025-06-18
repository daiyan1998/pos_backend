import express from 'express';
import { 
    getMenuItems,
    createMenuItem,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem,
    getMenuItemVariants
} from '../controllers/menu-item.controller.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { createMenuItemSchema, updateMenuItemSchema } from '../schemaValidation/menu-item.validation.ts';

const router = express.Router();

// GET & POST /api/v1/menu-items
router.route('/')
    .get(getMenuItems)
    .post(validateRequest(createMenuItemSchema), createMenuItem);

// GET, PUT & DELETE /api/v1/menu-items/:id
router.route('/:id')
    .get(getMenuItemById)
    .put(validateRequest(updateMenuItemSchema), updateMenuItem)
    .delete(deleteMenuItem);

// GET /api/v1/menu-items/:id/variants
router.route('/:id/variants')
    .get(getMenuItemVariants);

export default router; 