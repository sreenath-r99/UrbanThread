import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
} from "../services/adminOrderService.js";

/*
|--------------------------------------------------------------------------
| GET ADMIN ORDERS
|--------------------------------------------------------------------------
*/

const getAdminOrdersController =
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        status = "",
        sortOrder = "desc",
      } = req.query;

      const result =
        await getAdminOrders({
          page,
          limit,
          search,
          status,
          sortOrder,
        });

      return res.status(200).json({
        success: true,
        message:
          "Admin orders fetched successfully",
        ...result,
      });
    } catch (error) {
      console.error(
        "GET ADMIN ORDERS ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch orders",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| GET SINGLE ADMIN ORDER
|--------------------------------------------------------------------------
*/

const getAdminOrderController =
  async (req, res) => {
    try {
      const order =
        await getAdminOrderById(
          req.params.orderId
        );

      return res.status(200).json({
        success: true,
        message:
          "Admin order fetched successfully",
        order,
      });
    } catch (error) {
      console.error(
        "GET ADMIN ORDER ERROR:",
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
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/

const updateAdminOrderStatusController =
  async (req, res) => {
    try {
      const {
        status,
        reason = "",
      } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message:
            "Order status is required",
        });
      }

      const order =
        await updateAdminOrderStatus(
          req.params.orderId,
          status,
          reason
        );

      return res.status(200).json({
        success: true,
        message:
          "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error(
        "UPDATE ADMIN ORDER STATUS ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to update order status",
      });
    }
  };

export {
  getAdminOrdersController,
  getAdminOrderController,
  updateAdminOrderStatusController,
};