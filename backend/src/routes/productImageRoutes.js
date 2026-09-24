import express from "express";

import {
  uploadImages,
  deleteImage,
} from "../controllers/productImageController.js";

import { protectAdmin } from "../middleware/adminMiddleware.js";

import { uploadProductImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN PROTECTION
|--------------------------------------------------------------------------
*/

router.use(protectAdmin);

/*
|--------------------------------------------------------------------------
| UPLOAD PRODUCT IMAGES
|--------------------------------------------------------------------------
*/

router.post("/upload", uploadProductImages.array("images", 5), uploadImages);

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT IMAGE
|--------------------------------------------------------------------------
*/

router.delete("/delete", deleteImage);

export default router;
