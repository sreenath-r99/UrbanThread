import express from "express";

import {
  createOrderController,
  getOrdersController,
  getOrderController,
  cancelOrderController,
  cancelOrderItemController,
  returnOrderItemController,
  downloadOrderInvoiceController,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

router.post("/", createOrderController);

/*
|--------------------------------------------------------------------------
| GET ALL USER ORDERS
|--------------------------------------------------------------------------
|
| Supports optional search query:
| GET /api/orders?search=UT-1234
|
|--------------------------------------------------------------------------
*/

router.get("/", getOrdersController);

/*
|--------------------------------------------------------------------------
| CANCEL SPECIFIC ORDER ITEM
|--------------------------------------------------------------------------
*/

router.patch(
  "/:orderId/items/:itemId/cancel",
  cancelOrderItemController,
);

/*
|--------------------------------------------------------------------------
| REQUEST RETURN FOR SPECIFIC ORDER ITEM
|--------------------------------------------------------------------------
|
| Only delivered orders are eligible.
| Return reason is mandatory.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/:orderId/items/:itemId/return",
  returnOrderItemController,
);

/*
|--------------------------------------------------------------------------
| CANCEL ENTIRE ORDER
|--------------------------------------------------------------------------
*/

router.patch(
  "/:orderId/cancel",
  cancelOrderController,
);

/*
|--------------------------------------------------------------------------
| DOWNLOAD ORDER INVOICE
|--------------------------------------------------------------------------
*/

router.get(
  "/:orderId/invoice",
  downloadOrderInvoiceController,
);

/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER
|--------------------------------------------------------------------------
*/

router.get(
  "/:orderId",
  getOrderController,
);

export default router;