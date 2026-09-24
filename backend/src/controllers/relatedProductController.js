import { getRelatedProducts } from "../services/relatedProductService.js";

const getRelatedProductsController = async (req, res) => {
  try {
    const { productId } = req.params;

    const { limit = 4 } = req.query;

    const products = await getRelatedProducts(productId, limit);

    res.status(200).json({
      success: true,
      message: "Related products fetched successfully",
      products,
    });
  } catch (error) {
    const statusCode =
      error.message === "Product is unavailable or no longer exists"
        ? 404
        : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch related products",
    });
  }
};

export { getRelatedProductsController };
