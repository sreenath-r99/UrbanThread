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

// All category routes require admin authentication
router.use(protectAdmin);

// Get all categories
router.get("/", getCategories);

// Get one category
router.get("/:categoryId", getCategory);

// Create category
router.post("/", createCategory);

// Update category
router.put("/:categoryId", updateCategory);

// Toggle active/inactive status
router.patch(
  "/:categoryId/toggle-status",
  toggleCategoryStatus
);

// Soft delete category
router.delete("/:categoryId", deleteCategory);

export default router;