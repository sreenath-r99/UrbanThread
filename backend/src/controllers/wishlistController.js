// backend/src/controllers/wishlistController.js

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isProductInWishlist,
  clearWishlist,
} from "../services/wishlistService.js";

const getWishlistController = async (req, res) => {
  try {
    const wishlist = await getWishlist(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch wishlist",
    });
  }
};

const addToWishlistController = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await addToWishlist(req.user._id, productId);

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("ADD WISHLIST ERROR:", error.message);

    const statusCode =
      error.message === "Product is unavailable or no longer exists"
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to add product to wishlist",
    });
  }
};

const removeFromWishlistController = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await removeFromWishlist(req.user._id, productId);

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("REMOVE WISHLIST ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to remove product from wishlist",
    });
  }
};

const checkWishlistController = async (req, res) => {
  try {
    const { productId } = req.params;

    const isWishlisted = await isProductInWishlist(req.user._id, productId);

    return res.status(200).json({
      success: true,
      isWishlisted,
    });
  } catch (error) {
    console.error("CHECK WISHLIST ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to check wishlist",
    });
  }
};

const clearWishlistController = async (req, res) => {
  try {
    const wishlist = await clearWishlist(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      wishlist,
    });
  } catch (error) {
    console.error("CLEAR WISHLIST ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear wishlist",
    });
  }
};

export {
  getWishlistController,
  addToWishlistController,
  removeFromWishlistController,
  checkWishlistController,
  clearWishlistController,
};
