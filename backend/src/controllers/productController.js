import * as productService from "../services/productService.js";

/*
|--------------------------------------------------------------------------
| GET PRODUCTS - ADMIN
|--------------------------------------------------------------------------
*/

const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      categoryId = "",
      subcategoryId = "",
      includeInactive = "true",
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const result = await productService.getAllProducts({
      search,
      categoryId,
      subcategoryId,
      includeInactive: includeInactive === "true",
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PRODUCT - ADMIN
|--------------------------------------------------------------------------
*/

const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await productService.getProductById(productId);

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PRODUCT - PUBLIC USER
|--------------------------------------------------------------------------
*/

const getPublicProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await productService.getPublicProductById(productId);

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    const statusCode =
      error.message === "Product is unavailable or no longer exists"
        ? 404
        : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT - ADMIN
|--------------------------------------------------------------------------
*/

const addProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    const statusCode = error.message.includes("already exists") ? 409 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT - ADMIN
|--------------------------------------------------------------------------
*/

const editProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await productService.updateProduct(productId, req.body);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    const statusCode =
      error.message === "Product not found"
        ? 404
        : error.message.includes("already exists")
          ? 409
          : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

/*
|--------------------------------------------------------------------------
| TOGGLE PRODUCT STATUS - ADMIN
|--------------------------------------------------------------------------
*/

const toggleStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await productService.toggleProductStatus(productId);

    res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      product,
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update product status",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT - ADMIN
|--------------------------------------------------------------------------
*/

const removeProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    await productService.deleteProduct(productId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PUBLIC PRODUCTS - USER SHOP
|--------------------------------------------------------------------------
*/

const getPublicProducts = async (req, res) => {
  try {
    const {
      search = "",
      categoryId = "",
      subcategoryId = "",
      minPrice = "",
      maxPrice = "",
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const result = await productService.getPublicProducts({
      search,
      categoryId,
      subcategoryId,
      minPrice,
      maxPrice,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get public products error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export {
  getProducts,
  getPublicProducts,
  getPublicProductById,
  getSingleProduct,
  addProduct,
  editProduct,
  toggleStatus,
  removeProduct,
};
