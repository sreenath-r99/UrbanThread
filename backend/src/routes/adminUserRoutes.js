import express from "express";

import {
  getUsers,
  getUser,
  blockUser,
  unblockUser,
} from "../controllers/adminUserController.js";

import {
  protectAdmin,
} from "../middleware/adminMiddleware.js";

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| PROTECT ALL ADMIN USER ROUTES
|--------------------------------------------------------------------------
*/

router.use(protectAdmin);

/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
|
| GET /api/admin/users
|
| Search:
| GET /api/admin/users?search=john
|
| Pagination:
| GET /api/admin/users?page=1&limit=10
|
*/

router.get(
  "/",
  getUsers
);

/*
|--------------------------------------------------------------------------
| GET SINGLE USER
|--------------------------------------------------------------------------
*/

router.get(
  "/:userId",
  getUser
);

/*
|--------------------------------------------------------------------------
| BLOCK USER
|--------------------------------------------------------------------------
*/

router.patch(
  "/:userId/block",
  blockUser
);

/*
|--------------------------------------------------------------------------
| UNBLOCK USER
|--------------------------------------------------------------------------
*/

router.patch(
  "/:userId/unblock",
  unblockUser
);

export default router;