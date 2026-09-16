import express from "express";

import {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// PROTECTED ADDRESS ROUTES
// ==========================

// Get all addresses
router.get(
  "/",
  protect,
  getAddresses
);

// Create address
router.post(
  "/",
  protect,
  createAddress
);

// Get one address
router.get(
  "/:addressId",
  protect,
  getAddress
);

// Update address
router.put(
  "/:addressId",
  protect,
  updateAddress
);

// Delete address
router.delete(
  "/:addressId",
  protect,
  deleteAddress
);

// Set default address
router.patch(
  "/:addressId/default",
  protect,
  setDefaultAddress
);

export default router;