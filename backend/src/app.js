import authRoutes from "./routes/authRoutes.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import addressRoutes from "./routes/addressRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

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

export default app;