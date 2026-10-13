import express from "express";

import {
  getAdminOrdersController,
  getAdminOrderController,
  updateAdminOrderStatusController,
  updateAdminOrderItemReturnController,
} from "../controllers/adminOrderController.js";

import {
  protectAdmin,
} from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
 * All admin order routes require admin authentication.
 */

router.use(protectAdmin);

/*
|--------------------------------------------------------------------------
| GET ALL ORDERS
|--------------------------------------------------------------------------
| GET /api/admin/orders
*/

router.get("/", getAdminOrdersController);

/*
|--------------------------------------------------------------------------
| UPDATE ORDER ITEM RETURN STATUS
|--------------------------------------------------------------------------
| PATCH /api/admin/orders/:orderId/items/:itemId/return
|
| Body:
| {
|   "status": "Approved"
| }
|
| Or:
| {
|   "status": "Rejected"
| }
|--------------------------------------------------------------------------
*/

router.patch(
  "/:orderId/items/:itemId/return",
  updateAdminOrderItemReturnController,
);

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
| PATCH /api/admin/orders/:orderId/status
|--------------------------------------------------------------------------
*/

router.patch(
  "/:orderId/status",
  updateAdminOrderStatusController,
);

/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER
|--------------------------------------------------------------------------
| GET /api/admin/orders/:orderId
|--------------------------------------------------------------------------
*/

router.get(
  "/:orderId",
  getAdminOrderController,
);

export default router;