import express from "express";

import {
  createOrderController,
  getOrdersController,
  getOrderController,
  cancelOrderController,
  cancelOrderItemController,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

/*
|----------------------------------------------------------------------
| CREATE ORDER
|----------------------------------------------------------------------
*/

router.post("/", createOrderController);

/*
|----------------------------------------------------------------------
| GET ALL USER ORDERS
|----------------------------------------------------------------------
*/

router.get("/", getOrdersController);

/*
|----------------------------------------------------------------------
| CANCEL SPECIFIC ORDER ITEM
|----------------------------------------------------------------------
*/

router.patch("/:orderId/items/:itemId/cancel", cancelOrderItemController);

/*
|----------------------------------------------------------------------
| CANCEL ENTIRE ORDER
|----------------------------------------------------------------------
*/

router.patch("/:orderId/cancel", cancelOrderController);

/*
|----------------------------------------------------------------------
| GET SINGLE ORDER
|----------------------------------------------------------------------
*/

router.get("/:orderId", getOrderController);

export default router;
