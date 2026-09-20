import authRoutes from "./routes/authRoutes.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import addressRoutes from "./routes/addressRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import productImageRoutes from "./routes/productImageRoutes.js";


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running successfully",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/addresses", addressRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/admin/categories", categoryRoutes);

app.use(
  "/api/admin/subcategories",
  subcategoryRoutes
);

app.use(
  "/api/admin/products",
  productRoutes
);

app.use(
  "/api/admin/product-images",
  productImageRoutes
);

export default app;