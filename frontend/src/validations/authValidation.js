import { z } from "zod";

// ==========================
// REGISTER VALIDATION
// ==========================

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),

    agree: z
      .boolean()
      .refine(
        (value) => value === true,
        {
          message: "Please accept Terms and Conditions",
        }
      ),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );


// ==========================
// LOGIN VALIDATION
// ==========================

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});


// ==========================
// OTP VALIDATION
// ==========================

export const otpSchema = z.object({
  otp: z
    .string()
    .regex(
      /^\d{6}$/,
      "OTP must be exactly 6 digits"
    ),
});


// ==========================
// FORGOT PASSWORD VALIDATION
// ==========================

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),
});


// ==========================
// RESET PASSWORD VALIDATION
// ==========================

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address"),

    otp: z
      .string()
      .regex(
        /^\d{6}$/,
        "OTP must be exactly 6 digits"
      ),

    newPassword: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters"
      ),

    confirmPassword: z
      .string()
      .min(
        1,
        "Please confirm your password"
      ),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );