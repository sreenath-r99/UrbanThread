
import {
  createOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
} from "../services/offerService.js";

const handleControllerError = (res, error) => {
  const message = error.message || "Something went wrong";

  const statusCode =
    message === "Offer not found" ? 404 :
    message === "Invalid offer ID" ||
    message === "Invalid product ID" ||
    message === "Invalid category ID" ? 400 :
    400;

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const createOfferController = async (req, res) => {
  try {
    const offer = await createOffer(req.body);

    return res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getAllOffersController = async (req, res) => {
  try {
    const result = await getAllOffers({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search || "",
      offerType: req.query.offerType || "",
      status: req.query.status || "",
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getOfferByIdController = async (req, res) => {
  try {
    const offer = await getOfferById(req.params.offerId);

    return res.status(200).json({
      success: true,
      offer,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const updateOfferController = async (req, res) => {
  try {
    const offer = await updateOffer(
      req.params.offerId,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const toggleOfferStatusController = async (req, res) => {
  try {
    const { isActive } = req.body;

    const offer = await toggleOfferStatus(
      req.params.offerId,
      isActive,
    );

    return res.status(200).json({
      success: true,
      message: `Offer ${isActive ? "activated" : "deactivated"} successfully`,
      offer,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const deleteOfferController = async (req, res) => {
  try {
    const result = await deleteOffer(req.params.offerId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
