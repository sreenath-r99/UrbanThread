import express from "express";

import {
  getAdminOrdersController,
  getAdminOrderController,
  updateAdminOrderStatusController,
} from "../controllers/adminOrderController.js";

import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protectAdmin);

/*
|--------------------------------------------------------------------------
| GET ALL ORDERS
|--------------------------------------------------------------------------
|
| GET /api/admin/orders
|
*/

router.get(
  "/",
  getAdminOrdersController
);

/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER
|--------------------------------------------------------------------------
|
| GET /api/admin/orders/:orderId
|
*/

router.get(
  "/:orderId",
  getAdminOrderController
);

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
|
| PATCH /api/admin/orders/:orderId/status
|
*/

router.patch(
  "/:orderId/status",
  updateAdminOrderStatusController
);

export default router;