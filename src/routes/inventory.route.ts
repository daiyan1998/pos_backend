import { Router } from 'express';
import {
  createInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventory.controller';
// import validateRequest from '../middleware/validateRequest';
// import { inventoryValidation } from '../schemaValidation/inventory.validation';

const router = Router();

router.post('/', /*validateRequest(inventoryValidation.create),*/ createInventoryItem);
router.get('/', getAllInventoryItems);
router.get('/:id', getInventoryItemById);
router.put('/:id', /*validateRequest(inventoryValidation.update),*/ updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

export default router; 