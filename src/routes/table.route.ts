import express from 'express';
import { getTables, createTable, updateTableStatus, deleteTable } from '../controllers/table.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = express.Router();

// GET /tables, POST /tables
router.route('/')
    .get(getTables)
    .post(verifyJWT,createTable);

// PUT /tables/:id/status
router.route('/:id/status')
    .put(verifyJWT,updateTableStatus);

// DELETE /tables/:id
router.route('/:id')
    .delete(verifyJWT,deleteTable);

export default router; 