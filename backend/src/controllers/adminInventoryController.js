import {
  getInventory,
  updateInventoryStock,
} from "../services/adminInventoryService.js";

/*
|--------------------------------------------------------------------------
| GET INVENTORY
|--------------------------------------------------------------------------
*/

const getInventoryController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "" } = req.query;

    const result = await getInventory({
      page,
      limit,
      search,
      status,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("GET INVENTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch inventory",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE STOCK
|--------------------------------------------------------------------------
*/

const updateInventoryStockController = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await updateInventoryStock(productId, req.body);

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      product: result,
    });
  } catch (error) {
    console.error("UPDATE INVENTORY STOCK ERROR:", error);

    const statusCode = error.message === "Product not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update stock",
    });
  }
};

export { getInventoryController, updateInventoryStockController };
