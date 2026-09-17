import {
  getAllSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  toggleSubcategoryStatus,
  deleteSubcategory,
} from "../services/subcategoryService.js";

// ==========================
// GET ALL SUBCATEGORIES
// ==========================

export const getSubcategories = async (req, res) => {
  try {
    const {
      search = "",
      categoryId = "",
    } = req.query;

    const subcategories = await getAllSubcategories({
      search,
      categoryId,
    });

    return res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      subcategories,
    });
  } catch (error) {
    console.error(
      "Get subcategories error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subcategories",
    });
  }
};

// ==========================
// GET SINGLE SUBCATEGORY
// ==========================

export const getSingleSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const subcategory = await getSubcategoryById(
      subcategoryId
    );

    return res.status(200).json({
      success: true,
      message: "Subcategory fetched successfully",
      subcategory,
    });
  } catch (error) {
    console.error(
      "Get single subcategory error:",
      error.message
    );

    return res.status(404).json({
      success: false,
      message: error.message || "Subcategory not found",
    });
  }
};

// ==========================
// CREATE SUBCATEGORY
// ==========================

export const addSubcategory = async (req, res) => {
  try {
    const subcategory = await createSubcategory(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      subcategory,
    });
  } catch (error) {
    console.error(
      "Create subcategory error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create subcategory",
    });
  }
};

// ==========================
// UPDATE SUBCATEGORY
// ==========================

export const editSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const subcategory = await updateSubcategory(
      subcategoryId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      subcategory,
    });
  } catch (error) {
    console.error(
      "Update subcategory error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update subcategory",
    });
  }
};

// ==========================
// TOGGLE STATUS
// ==========================

export const toggleStatus = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const subcategory = await toggleSubcategoryStatus(
      subcategoryId
    );

    return res.status(200).json({
      success: true,
      message: "Subcategory status updated successfully",
      subcategory,
    });
  } catch (error) {
    console.error(
      "Toggle subcategory status error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
};

// ==========================
// DELETE SUBCATEGORY
// ==========================

export const removeSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    await deleteSubcategory(subcategoryId);

    return res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete subcategory error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete subcategory",
    });
  }
};