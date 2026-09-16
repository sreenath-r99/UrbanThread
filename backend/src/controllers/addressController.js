import {
  getUserAddresses,
  createUserAddress,
  getSingleUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
} from "../services/addressService.js";

// ==========================
// GET ALL ADDRESSES
// ==========================

export const getAddresses = async (req, res) => {
  try {
    const addresses = await getUserAddresses(
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      addresses,
    });
  } catch (error) {
    console.error(
      "GET ADDRESSES ERROR:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch addresses",
    });
  }
};

// ==========================
// GET SINGLE ADDRESS
// ==========================

export const getAddress = async (req, res) => {
  try {
    const address = await getSingleUserAddress(
      req.user._id,
      req.params.addressId
    );

    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      address,
    });
  } catch (error) {
    console.error(
      "GET SINGLE ADDRESS ERROR:",
      error.message
    );

    return res.status(404).json({
      success: false,
      message: error.message || "Address not found",
    });
  }
};

// ==========================
// CREATE ADDRESS
// ==========================

export const createAddress = async (req, res) => {
  try {
    const address = await createUserAddress(
      req.user._id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error(
      "CREATE ADDRESS ERROR:",
      error.message
    );

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Please enter valid address details",
        errors: error.flatten().fieldErrors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to add address",
    });
  }
};

// ==========================
// UPDATE ADDRESS
// ==========================

export const updateAddress = async (req, res) => {
  try {
    const address = await updateUserAddress(
      req.user._id,
      req.params.addressId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error(
      "UPDATE ADDRESS ERROR:",
      error.message
    );

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Please enter valid address details",
        errors: error.flatten().fieldErrors,
      });
    }

    return res.status(404).json({
      success: false,
      message: error.message || "Unable to update address",
    });
  }
};

// ==========================
// DELETE ADDRESS
// ==========================

export const deleteAddress = async (req, res) => {
  try {
    await deleteUserAddress(
      req.user._id,
      req.params.addressId
    );

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ADDRESS ERROR:",
      error.message
    );

    return res.status(404).json({
      success: false,
      message: error.message || "Unable to delete address",
    });
  }
};

// ==========================
// SET DEFAULT ADDRESS
// ==========================

export const setDefaultAddress = async (req, res) => {
  try {
    const address = await setDefaultUserAddress(
      req.user._id,
      req.params.addressId
    );

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      address,
    });
  } catch (error) {
    console.error(
      "SET DEFAULT ADDRESS ERROR:",
      error.message
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Unable to set default address",
    });
  }
};