import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} from "../services/productService.js";

// ==========================
// GET ALL PRODUCTS
// ==========================

export const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      categoryId = "",
      subcategoryId = "",
    } = req.query;

    const products = await getAllProducts({
      search,
      categoryId,
      subcategoryId,
    });

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

// ==========================
// GET SINGLE PRODUCT
// ==========================

export const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await getProductById(productId);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Get single product error:",
      error.message
    );

    return res.status(404).json({
      success: false,
      message: error.message || "Product not found",
    });
  }
};

// ==========================
// CREATE PRODUCT
// ==========================

export const addProduct = async (req, res) => {
  try {
    const product = await createProduct(req.body);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// ==========================
// UPDATE PRODUCT
// ==========================

export const editProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await updateProduct(
      productId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// ==========================
// TOGGLE STATUS
// ==========================

export const toggleStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await toggleProductStatus(productId);

    return res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Toggle product status error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update product status",
    });
  }
};

// ==========================
// DELETE PRODUCT
// ==========================

export const removeProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    await deleteProduct(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};