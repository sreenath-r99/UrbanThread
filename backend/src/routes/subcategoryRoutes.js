import express from "express";

import {
  getSubcategories,
  getSingleSubcategory,
  addSubcategory,
  editSubcategory,
  toggleStatus,
  removeSubcategory,
} from "../controllers/subcategoryController.js";

import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// All subcategory routes require admin authentication
router.use(protectAdmin);

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