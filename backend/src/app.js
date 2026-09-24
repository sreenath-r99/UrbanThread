import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";

import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import productImageRoutes from "./routes/productImageRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminInventoryRoutes from "./routes/adminInventoryRoutes.js";
import adminReviewRoutes from "./routes/adminReviewRoutes.js";

import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import ratingRoutes from "./routes/ratingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import availableCouponRoutes from "./routes/availableCouponRoutes.js";

const app = express();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

/*
|--------------------------------------------------------------------------
| BODY PARSERS
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/*
|--------------------------------------------------------------------------
| COOKIE PARSER
|--------------------------------------------------------------------------
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running successfully",
  });
});

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| USER ADDRESSES
|--------------------------------------------------------------------------
*/

app.use("/api/addresses", addressRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

app.use("/api/admin", adminRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN CATEGORIES
|--------------------------------------------------------------------------
*/

app.use("/api/admin/categories", categoryRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN SUBCATEGORIES
|--------------------------------------------------------------------------
*/

app.use("/api/admin/subcategories", subcategoryRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN PRODUCTS
|--------------------------------------------------------------------------
*/

app.use("/api/admin/products", productRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN PRODUCT IMAGES
|--------------------------------------------------------------------------
*/

app.use("/api/admin/product-images", productImageRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN USERS
|--------------------------------------------------------------------------
*/

app.use("/api/admin/users", adminUserRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN ORDER MANAGEMENT
|--------------------------------------------------------------------------
*/

app.use("/api/admin/orders", adminOrderRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN INVENTORY
|--------------------------------------------------------------------------
*/

app.use("/api/admin/inventory", adminInventoryRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN REVIEWS
|--------------------------------------------------------------------------
*/

app.use("/api/admin/reviews", adminReviewRoutes);

/*
|--------------------------------------------------------------------------
| CART
|--------------------------------------------------------------------------
*/

app.use("/api/cart", cartRoutes);

/*
|--------------------------------------------------------------------------
| WISHLIST
|--------------------------------------------------------------------------
*/

app.use("/api/wishlist", wishlistRoutes);

/*
|--------------------------------------------------------------------------
| USER ORDERS
|--------------------------------------------------------------------------
*/

app.use("/api/orders", orderRoutes);

/*
|--------------------------------------------------------------------------
| PRODUCT RATINGS
|--------------------------------------------------------------------------
*/

app.use("/api/ratings", ratingRoutes);

/*
|--------------------------------------------------------------------------
| PRODUCT REVIEWS
|--------------------------------------------------------------------------
*/

app.use("/api/reviews", reviewRoutes);

/*
|--------------------------------------------------------------------------
| AVAILABLE CUSTOMER COUPONS
|--------------------------------------------------------------------------
|
| GET:
| /api/coupons/available?subtotal=1000
|
| POST:
| /api/coupons/available/apply
|
| These routes are used by the Checkout page to:
| - show only applicable coupons
| - validate/apply a selected coupon
|
|--------------------------------------------------------------------------
*/

app.use("/api/coupons/available", availableCouponRoutes);

/*
|--------------------------------------------------------------------------
| COUPONS
|--------------------------------------------------------------------------
|
| Admin:
| - Create coupon
| - Get coupons
| - Get single coupon
| - Update coupon
| - Toggle coupon
| - Delete coupon
|
| Customer:
| - Validate coupon
|
|--------------------------------------------------------------------------
*/

app.use("/api/coupons", couponRoutes);

export default app;
