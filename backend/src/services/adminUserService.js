import mongoose from "mongoose";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| GET ADMIN USER LIST
|--------------------------------------------------------------------------
|
| Supports:
| - Backend search
| - Backend pagination
| - Latest users first
|
*/

export const getAllUsers = async ({ search = "", page = 1, limit = 10 }) => {
  const currentPage = Math.max(Number(page) || 1, 1);

  const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const skip = (currentPage - 1) * pageLimit;

  /*
  |--------------------------------------------------------------------------
  | BASE QUERY
  |--------------------------------------------------------------------------
  |
  | Admin accounts are stored separately,
  | but we also exclude role=admin as an
  | additional safety measure.
  |
  */

  const query = {
    role: {
      $ne: "admin",
    },
  };

  /*
  |--------------------------------------------------------------------------
  | BACKEND SEARCH
  |--------------------------------------------------------------------------
  */

  const trimmedSearch = String(search).trim();

  if (trimmedSearch) {
    const searchRegex = new RegExp(
      trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );

    query.$or = [
      {
        name: searchRegex,
      },
      {
        email: searchRegex,
      },
    ];
  }

  /*
  |--------------------------------------------------------------------------
  | FETCH USERS + COUNT
  |--------------------------------------------------------------------------
  */

  const [users, totalUsers] = await Promise.all([
    User.find(query)
      .select("-password -otp -otpExpires")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    User.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalUsers / pageLimit) || 1;

  return {
    users,
    pagination: {
      currentPage,
      totalPages,
      totalUsers,
      limit: pageLimit,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET SINGLE USER
|--------------------------------------------------------------------------
*/

export const getUserById = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const user = await User.findOne({
    _id: userId,
    role: {
      $ne: "admin",
    },
  })
    .select("-password -otp -otpExpires")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

/*
|--------------------------------------------------------------------------
| BLOCK USER
|--------------------------------------------------------------------------
*/

export const blockUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const user = await User.findOne({
    _id: userId,
    role: {
      $ne: "admin",
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isBlocked) {
    throw new Error("User is already blocked");
  }

  user.isBlocked = true;

  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isBlocked: user.isBlocked,
  };
};

/*
|--------------------------------------------------------------------------
| UNBLOCK USER
|--------------------------------------------------------------------------
*/

export const unblockUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const user = await User.findOne({
    _id: userId,
    role: {
      $ne: "admin",
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isBlocked) {
    throw new Error("User is already unblocked");
  }

  user.isBlocked = false;

  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isBlocked: user.isBlocked,
  };
};
