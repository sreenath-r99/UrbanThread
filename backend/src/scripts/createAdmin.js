import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminName = process.env.ADMIN_NAME || "UrbanThread Admin";

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env",
      );
    }

    const normalizedEmail = adminEmail.trim().toLowerCase();

    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (existingAdmin) {
      console.log("Admin account already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await Admin.create({
      name: adminName,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: true,
      isBlocked: false,
    });

    console.log("Admin account created successfully");
    console.log(`Admin email: ${admin.email}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);

    process.exit(1);
  }
};

createAdmin();
