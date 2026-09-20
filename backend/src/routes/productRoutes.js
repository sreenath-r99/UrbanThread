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

router.use(protectAdmin);

router.get("/", getProducts);

router.get("/:productId", getSingleProduct);

router.post("/", addProduct);

router.put("/:productId", editProduct);

router.patch(
  "/:productId/toggle-status",
  toggleStatus
);

router.delete(
  "/:productId",
  removeProduct
);

export default router;