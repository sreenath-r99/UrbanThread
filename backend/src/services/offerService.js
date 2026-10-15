
import mongoose from "mongoose";
import Offer from "../models/Offer.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const roundMoney = (amount) =>
  Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

const validateOfferReferences = async ({
  offerType,
  product,
  category,
}) => {
  if (offerType === "Product") {
    if (!mongoose.Types.ObjectId.isValid(product)) {
      throw new Error("Please select a valid product");
    }

    const existingProduct = await Product.findOne({
      _id: product,
      isDeleted: false,
      isActive: true,
    }).lean();

    if (!existingProduct) {
      throw new Error("Selected product does not exist or is inactive");
    }
  }

  if (offerType === "Category") {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw new Error("Please select a valid category");
    }

    const existingCategory = await Category.findById(category).lean();

    if (
      !existingCategory ||
      existingCategory.isDeleted === true ||
      existingCategory.isActive === false
    ) {
      throw new Error("Selected category does not exist or is inactive");
    }
  }
};

const validateOfferDates = ({ startDate, endDate }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new Error("Please provide valid offer dates");
  }

  if (end <= start) {
    throw new Error("Offer end date must be after its start date");
  }
};

const normalizeOfferData = (data) => {
  const {
    name,
    description = "",
    offerType,
    product,
    category,
    discountType,
    discountValue,
    startDate,
    endDate,
    isActive = true,
  } = data;

  if (!name || !name.trim()) {
    throw new Error("Offer name is required");
  }

  if (!["Product", "Category"].includes(offerType)) {
    throw new Error("Offer type must be Product or Category");
  }

  if (!["Percentage", "Fixed"].includes(discountType)) {
    throw new Error("Discount type must be Percentage or Fixed");
  }

  const numericDiscount = Number(discountValue);

  if (
    !Number.isFinite(numericDiscount) ||
    numericDiscount <= 0
  ) {
    throw new Error("Discount value must be greater than zero");
  }

  if (
    discountType === "Percentage" &&
    numericDiscount > 100
  ) {
    throw new Error("Percentage discount cannot exceed 100%");
  }

  if (typeof isActive !== "boolean") {
    throw new Error("isActive must be a boolean");
  }

  validateOfferDates({ startDate, endDate });

  return {
    name: name.trim(),
    description: String(description).trim(),
    offerType,
    product: offerType === "Product" ? product : null,
    category: offerType === "Category" ? category : null,
    discountType,
    discountValue: roundMoney(numericDiscount),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    isActive,
  };
};

export const createOffer = async (data) => {
  const offerData = normalizeOfferData(data);

  await validateOfferReferences(offerData);

  const offer = await Offer.create(offerData);

  return offer;
};

export const getAllOffers = async ({
  page = 1,
  limit = 10,
  search = "",
  offerType = "",
  status = "",
} = {}) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(
    50,
    Math.max(1, Number.parseInt(limit, 10) || 10),
  );

  const filter = {
    isDeleted: false,
  };

  if (search.trim()) {
    filter.name = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  if (offerType) {
    if (!["Product", "Category"].includes(offerType)) {
      throw new Error("Invalid offer type filter");
    }

    filter.offerType = offerType;
  }

  if (status === "active") {
    filter.isActive = true;
  } else if (status === "inactive") {
    filter.isActive = false;
  } else if (status && status !== "all") {
    throw new Error("Invalid offer status filter");
  }

  const [offers, total] = await Promise.all([
    Offer.find(filter)
      .populate("product", "name price discountPrice")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),

    Offer.countDocuments(filter),
  ]);

  return {
    offers,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

export const getOfferById = async (offerId) => {
  if (!mongoose.Types.ObjectId.isValid(offerId)) {
    throw new Error("Invalid offer ID");
  }

  const offer = await Offer.findOne({
    _id: offerId,
    isDeleted: false,
  })
    .populate("product", "name price discountPrice")
    .populate("category", "name")
    .lean();

  if (!offer) {
    throw new Error("Offer not found");
  }

  return offer;
};

export const updateOffer = async (offerId, data) => {
  if (!mongoose.Types.ObjectId.isValid(offerId)) {
    throw new Error("Invalid offer ID");
  }

  const existingOffer = await Offer.findOne({
    _id: offerId,
    isDeleted: false,
  });

  if (!existingOffer) {
    throw new Error("Offer not found");
  }

  const offerData = normalizeOfferData(data);

  await validateOfferReferences(offerData);

  Object.assign(existingOffer, offerData);

  await existingOffer.save();

  return existingOffer;
};

export const toggleOfferStatus = async (offerId, isActive) => {
  if (!mongoose.Types.ObjectId.isValid(offerId)) {
    throw new Error("Invalid offer ID");
  }

  if (typeof isActive !== "boolean") {
    throw new Error("isActive must be true or false");
  }

  const offer = await Offer.findOne({
    _id: offerId,
    isDeleted: false,
  });

  if (!offer) {
    throw new Error("Offer not found");
  }

  offer.isActive = isActive;

  await offer.save();

  return offer;
};

export const deleteOffer = async (offerId) => {
  if (!mongoose.Types.ObjectId.isValid(offerId)) {
    throw new Error("Invalid offer ID");
  }

  const offer = await Offer.findOne({
    _id: offerId,
    isDeleted: false,
  });

  if (!offer) {
    throw new Error("Offer not found");
  }

  offer.isDeleted = true;
  offer.isActive = false;

  await offer.save();

  return {
    message: "Offer deleted successfully",
  };
};
