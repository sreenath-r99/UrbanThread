import express from "express";

import {
  getProducts,
  getSingleProduct,
  addProduct,
  editProduct,
  toggleStatus,
  removeProduct,
} from "../controllers/productController.js";

import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// All product management routes require admin authentication
router.use(protectAdmin);

// GET /api/admin/products
router.get(
  "/",
  getProducts
);

// GET /api/admin/products/:productId
router.get(
  "/:productId",
  getSingleProduct
);

// POST /api/admin/products
router.post(
  "/",
  addProduct
);

// PUT /api/admin/products/:productId
router.put(
  "/:productId",
  editProduct
);

// PATCH /api/admin/products/:productId/toggle-status
router.patch(
  "/:productId/toggle-status",
  toggleStatus
);

// DELETE /api/admin/products/:productId
router.delete(
  "/:productId",
  removeProduct
);

export default router;