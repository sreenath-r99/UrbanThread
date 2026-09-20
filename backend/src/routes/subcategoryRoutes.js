import express from "express";

import {
  getSubcategories,
  getPublicSubcategories,
  getSingleSubcategory,
  addSubcategory,
  editSubcategory,
  toggleStatus,
  removeSubcategory,
} from "../controllers/subcategoryController.js";

import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC SUBCATEGORY ROUTES
|--------------------------------------------------------------------------
|
| These routes are accessible without admin authentication.
|
*/

// GET /api/admin/subcategories/store
//
// Optional:
// ?categoryId=<categoryId>
//
// Examples:
//
// /api/admin/subcategories/store
//
// /api/admin/subcategories/store?categoryId=<categoryId>
//
router.get(
  "/store",
  getPublicSubcategories
);

/*
|--------------------------------------------------------------------------
| ADMIN AUTHENTICATION
|--------------------------------------------------------------------------
|
| Everything below this point requires admin authentication.
|
*/

router.use(protectAdmin);

/*
|--------------------------------------------------------------------------
| ADMIN SUBCATEGORY ROUTES
|--------------------------------------------------------------------------
*/

// GET /api/admin/subcategories
router.get(
  "/",
  getSubcategories
);

// GET /api/admin/subcategories/:subcategoryId
router.get(
  "/:subcategoryId",
  getSingleSubcategory
);

// POST /api/admin/subcategories
router.post(
  "/",
  addSubcategory
);

// PUT /api/admin/subcategories/:subcategoryId
router.put(
  "/:subcategoryId",
  editSubcategory
);

// PATCH /api/admin/subcategories/:subcategoryId/toggle-status
router.patch(
  "/:subcategoryId/toggle-status",
  toggleStatus
);

// DELETE /api/admin/subcategories/:subcategoryId
router.delete(
  "/:subcategoryId",
  removeSubcategory
);

export default router;