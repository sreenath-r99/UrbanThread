import * as adminUserService from "../services/adminUserService.js";

/*
|--------------------------------------------------------------------------
| GET USERS
|--------------------------------------------------------------------------
*/

export const getUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const result = await adminUserService.getAllUsers({
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("GET ADMIN USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE USER
|--------------------------------------------------------------------------
*/

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await adminUserService.getUserById(userId);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("GET ADMIN USER ERROR:", error);

    const statusCode = error.message === "User not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch user",
    });
  }
};

/*
|--------------------------------------------------------------------------
| BLOCK USER
|--------------------------------------------------------------------------
*/

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await adminUserService.blockUser(userId);

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
      user,
    });
  } catch (error) {
    console.error("BLOCK USER ERROR:", error);

    const statusCode = error.message === "User not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to block user",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UNBLOCK USER
|--------------------------------------------------------------------------
*/

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await adminUserService.unblockUser(userId);

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      user,
    });
  } catch (error) {
    console.error("UNBLOCK USER ERROR:", error);

    const statusCode = error.message === "User not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to unblock user",
    });
  }
};
