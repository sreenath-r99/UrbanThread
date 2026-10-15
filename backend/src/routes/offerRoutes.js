
import express from "express";

import {
  createOfferController,
  getAllOffersController,
  getOfferByIdController,
  updateOfferController,
  toggleOfferStatusController,
  deleteOfferController,
} from "../controllers/offerController.js";

import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// All offer-management endpoints require admin authentication.
router.use(protectAdmin);

// Create a new product or category offer.
router.post("/", createOfferController);

// Get all offers with optional search, filters, and pagination.
router.get("/", getAllOffersController);

// Get a single offer.
router.get("/:offerId", getOfferByIdController);

// Update an offer.
router.put("/:offerId", updateOfferController);

// Activate or deactivate an offer.
router.patch("/:offerId/status", toggleOfferStatusController);

// Soft-delete an offer.
router.delete("/:offerId", deleteOfferController);

export default router;
