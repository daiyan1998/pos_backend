import express from 'express';
import { getTables, createTable, updateTableStatus } from '../controllers/table.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = express.Router();

// GET /tables, POST /tables
router.route('/')
    .get(getTables)
    .post(verifyJWT,createTable);

// PUT /tables/:id/status
router.route('/:id/status')
    .put(verifyJWT,updateTableStatus);

export default router; 