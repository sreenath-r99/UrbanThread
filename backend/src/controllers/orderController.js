import {
  createOrder,
  getUserOrders,
  getUserOrderById,
  cancelUserOrder,
  cancelUserOrderItem,
} from "../services/orderService.js";

/*
|----------------------------------------------------------------------
| CREATE ORDER
|----------------------------------------------------------------------
*/

const createOrderController =
  async (req, res) => {
    try {
      const {
        addressId,
      } = req.body;

      if (!addressId) {
        return res.status(400).json({
          success: false,
          message:
            "Address ID is required",
        });
      }

      const order =
        await createOrder(
          req.user._id,
          addressId
        );

      return res.status(201).json({
        success: true,
        message:
          "Order placed successfully",
        order,
      });
    } catch (error) {
      console.error(
        "CREATE ORDER ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to place order",
      });
    }
  };

/*
|----------------------------------------------------------------------
| GET ORDERS
|----------------------------------------------------------------------
*/

const getOrdersController =
  async (req, res) => {
    try {
      const {
        search = "",
      } = req.query;

      const orders =
        await getUserOrders(
          req.user._id,
          search
        );

      return res.status(200).json({
        success: true,
        message:
          "Orders fetched successfully",
        orders,
      });
    } catch (error) {
      console.error(
        "GET ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch orders",
      });
    }
  };

/*
|----------------------------------------------------------------------
| GET SINGLE ORDER
|----------------------------------------------------------------------
*/

const getOrderController =
  async (req, res) => {
    try {
      const order =
        await getUserOrderById(
          req.user._id,
          req.params.orderId
        );

      return res.status(200).json({
        success: true,
        message:
          "Order fetched successfully",
        order,
      });
    } catch (error) {
      console.error(
        "GET ORDER ERROR:",
        error
      );

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          "Order not found",
      });
    }
  };

/*
|----------------------------------------------------------------------
| CANCEL ENTIRE ORDER
|----------------------------------------------------------------------
*/

const cancelOrderController =
  async (req, res) => {
    try {
      const {
        reason = "",
      } = req.body;

      const order =
        await cancelUserOrder(
          req.user._id,
          req.params.orderId,
          reason
        );

      return res.status(200).json({
        success: true,
        message:
          "Order cancelled successfully",
        order,
      });
    } catch (error) {
      console.error(
        "CANCEL ORDER ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to cancel order",
      });
    }
  };

/*
|----------------------------------------------------------------------
| CANCEL SPECIFIC ORDER ITEM
|----------------------------------------------------------------------
*/

const cancelOrderItemController =
  async (req, res) => {
    try {
      const {
        reason = "",
      } = req.body;

      const order =
        await cancelUserOrderItem(
          req.user._id,
          req.params.orderId,
          req.params.itemId,
          reason
        );

      return res.status(200).json({
        success: true,
        message:
          "Product cancelled successfully",
        order,
      });
    } catch (error) {
      console.error(
        "CANCEL ORDER ITEM ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to cancel product",
      });
    }
  };

export {
  createOrderController,
  getOrdersController,
  getOrderController,
  cancelOrderController,
  cancelOrderItemController,
};