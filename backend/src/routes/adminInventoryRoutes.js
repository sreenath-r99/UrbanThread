import express from "express";

import {
  getInventoryController,
  updateInventoryStockController,
} from "../controllers/adminInventoryController.js";

import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getInventoryController);

router.patch("/:productId/stock", updateInventoryStockController);

export default router;
