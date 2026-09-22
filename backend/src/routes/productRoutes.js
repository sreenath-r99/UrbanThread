import express from "express";

import {
  getProducts,
  getPublicProducts,
  getPublicProductById,
  getSingleProduct,
  addProduct,
  editProduct,
  toggleStatus,
  removeProduct,
} from "../controllers/productController.js";

import { getRelatedProductsController } from "../controllers/relatedProductController.js";

import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC USER PRODUCT ROUTES
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| SHOP PRODUCT LIST
|--------------------------------------------------------------------------
|
| GET /api/admin/products/store
|
*/

router.get("/store", getPublicProducts);

/*
|--------------------------------------------------------------------------
| RELATED PRODUCTS
|--------------------------------------------------------------------------
|
| GET /api/admin/products/store/:productId/related
|
| IMPORTANT:
| This must come before /store/:productId.
|
*/

router.get("/store/:productId/related", getRelatedProductsController);

/*
|--------------------------------------------------------------------------
| SINGLE PRODUCT DETAILS
|--------------------------------------------------------------------------
|
| GET /api/admin/products/store/:productId
|
*/

router.get("/store/:productId", getPublicProductById);

/*
|--------------------------------------------------------------------------
| ADMIN PRODUCT ROUTES
|--------------------------------------------------------------------------
|
| Everything below this point requires admin
| authentication.
|
*/

router.use(protectAdmin);

router.get("/", getProducts);

router.get("/:productId", getSingleProduct);

router.post("/", addProduct);

router.put("/:productId", editProduct);

router.patch("/:productId/toggle-status", toggleStatus);

router.delete("/:productId", removeProduct);

export default router;
