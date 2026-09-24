import express from "express";

import {
  getAllReviewsController,
  deleteReviewByAdminController,
} from "../controllers/reviewController.js";

import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL REVIEWS
|--------------------------------------------------------------------------
|
| GET /api/admin/reviews
|
| Query:
|
| ?page=1
| &limit=10
| &search=
|
|--------------------------------------------------------------------------
*/

router.get("/", protectAdmin, getAllReviewsController);

/*
|--------------------------------------------------------------------------
| DELETE REVIEW
|--------------------------------------------------------------------------
|
| DELETE /api/admin/reviews/:reviewId
|
|--------------------------------------------------------------------------
*/

router.delete("/:reviewId", protectAdmin, deleteReviewByAdminController);

export default router;
