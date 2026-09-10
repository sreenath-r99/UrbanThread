import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ==========================
    // BASIC USER INFORMATION
    // ==========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ==========================
    // LOCAL AUTHENTICATION
    // ==========================

    password: {
      type: String,
      minlength: 6,
      default: null,
    },

    // ==========================
    // CONTACT INFORMATION
    // ==========================

    phone: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    // ==========================
    // ROLE
    // ==========================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ==========================
    // ACCOUNT STATUS
    // ==========================

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // ==========================
    // AUTHENTICATION PROVIDER
    // ==========================

    authProvider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },

    // ==========================
    // GOOGLE AUTHENTICATION
    // ==========================

    googleId: {
      type: String,
      default: null,
    },

    googleImage: {
      type: String,
      default: "",
    },

    // ==========================
    // FACEBOOK AUTHENTICATION
    // ==========================

    facebookId: {
      type: String,
      default: null,
    },

    // ==========================
    // OTP VERIFICATION
    // ==========================

    otp: {
      type: String,
      select: false,
      default: null,
    },

    otpExpires: {
      type: Date,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

export default User;