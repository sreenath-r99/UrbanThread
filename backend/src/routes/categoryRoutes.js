import express from "express";

import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../controllers/categoryController.js";

import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin Authentication
|--------------------------------------------------------------------------
*/

router.use(protectAdmin);

/*
|--------------------------------------------------------------------------
| Category Routes
|--------------------------------------------------------------------------
*/

// Get categories
// GET /api/admin/categories
router.get("/", getCategories);

// Get single category
// GET /api/admin/categories/:categoryId
router.get("/:categoryId", getCategory);

// Create category
// POST /api/admin/categories
router.post("/", createCategory);

// Update category
// PUT /api/admin/categories/:categoryId
router.put("/:categoryId", updateCategory);

// Toggle active/inactive
// PATCH /api/admin/categories/:categoryId/toggle-status
router.patch(
  "/:categoryId/toggle-status",
  toggleCategoryStatus
);

// Soft delete
// DELETE /api/admin/categories/:categoryId
router.delete(
  "/:categoryId",
  deleteCategory
);

export default router;