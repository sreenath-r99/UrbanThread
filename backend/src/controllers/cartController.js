import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../services/cartService.js";

const getCartController = async (
  req,
  res
) => {
  try {
    const cart = await getCart(
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    console.error(
      "GET CART ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch cart",
    });
  }
};

const addToCartController = async (
  req,
  res
) => {
  try {
    const {
      productId,
      size,
      quantity,
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const cart = await addToCart(
      req.user._id,
      productId,
      size,
      quantity
    );

    return res.status(200).json({
      success: true,
      message:
        "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error(
      "ADD TO CART ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to add product to cart",
    });
  }
};

const updateCartItemController = async (
  req,
  res
) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await updateCartItem(
      req.user._id,
      itemId,
      quantity
    );

    return res.status(200).json({
      success: true,
      message:
        "Cart quantity updated successfully",
      cart,
    });
  } catch (error) {
    console.error(
      "UPDATE CART ITEM ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update cart item",
    });
  }
};

const removeFromCartController = async (
  req,
  res
) => {
  try {
    const { itemId } = req.params;

    const cart = await removeFromCart(
      req.user._id,
      itemId
    );

    return res.status(200).json({
      success: true,
      message:
        "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error(
      "REMOVE CART ITEM ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to remove cart item",
    });
  }
};

const clearCartController = async (
  req,
  res
) => {
  try {
    const cart = await clearCart(
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error(
      "CLEAR CART ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to clear cart",
    });
  }
};

export {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
};