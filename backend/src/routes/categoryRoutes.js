import express from "express";

import {
  getCategories,
  getPublicCategories,
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
| PUBLIC CATEGORY ROUTES
|--------------------------------------------------------------------------
|
| These routes are accessible without admin authentication.
|
*/

/*
|--------------------------------------------------------------------------
| Get active categories for User Side
|--------------------------------------------------------------------------
|
| GET /api/admin/categories/store
|
| NOTE:
| The final URL depends on where this router is mounted
| in app.js.
|
*/

router.get(
  "/store",
  getPublicCategories
);

/*
|--------------------------------------------------------------------------
| ADMIN AUTHENTICATION
|--------------------------------------------------------------------------
|
| Everything below this point requires
| admin authentication.
|
*/

router.use(protectAdmin);

/*
|--------------------------------------------------------------------------
| ADMIN CATEGORY ROUTES
|--------------------------------------------------------------------------
*/

// Get categories
// GET /api/admin/categories
router.get(
  "/",
  getCategories
);

// Get single category
// GET /api/admin/categories/:categoryId
router.get(
  "/:categoryId",
  getCategory
);

// Create category
// POST /api/admin/categories
router.post(
  "/",
  createCategory
);

// Update category
// PUT /api/admin/categories/:categoryId
router.put(
  "/:categoryId",
  updateCategory
);

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