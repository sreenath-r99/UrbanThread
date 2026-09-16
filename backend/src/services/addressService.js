import { z } from "zod";
import Address from "../models/Address.js";

// ==========================
// ADDRESS VALIDATION
// ==========================

const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters")
    .max(100, "Full name is too long"),

  phone: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian phone number"
    ),

  houseName: z
    .string()
    .trim()
    .min(2, "House or building name is required")
    .max(150, "House or building name is too long"),

  street: z
    .string()
    .trim()
    .min(2, "Street or area is required")
    .max(150, "Street or area is too long"),

  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(100, "City name is too long"),

  state: z
    .string()
    .trim()
    .min(2, "State is required")
    .max(100, "State name is too long"),

  pincode: z
    .string()
    .trim()
    .regex(
      /^\d{6}$/,
      "Pincode must contain exactly 6 digits"
    ),

  country: z
    .string()
    .trim()
    .min(2, "Country is required")
    .max(100, "Country name is too long"),

  addressType: z
    .enum(["Home", "Work", "Other"])
    .default("Home"),

  isDefault: z
    .boolean()
    .default(false),
});

// ==========================
// GET USER ADDRESSES
// ==========================

export const getUserAddresses = async (userId) => {
  const addresses = await Address.find({
    user: userId,
  }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  return addresses;
};

// ==========================
// CREATE ADDRESS
// ==========================

export const createUserAddress = async (
  userId,
  addressData
) => {
  const validatedData = addressSchema.parse(
    addressData
  );

  const existingAddressCount =
    await Address.countDocuments({
      user: userId,
    });

  let shouldBeDefault = validatedData.isDefault;

  // First address automatically becomes default
  if (existingAddressCount === 0) {
    shouldBeDefault = true;
  }

  if (shouldBeDefault) {
    await Address.updateMany(
      {
        user: userId,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );
  }

  const address = await Address.create({
    ...validatedData,
    user: userId,
    isDefault: shouldBeDefault,
  });

  return address;
};

// ==========================
// GET SINGLE ADDRESS
// ==========================

export const getSingleUserAddress = async (
  userId,
  addressId
) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new Error("Address not found");
  }

  return address;
};

// ==========================
// UPDATE ADDRESS
// ==========================

export const updateUserAddress = async (
  userId,
  addressId,
  addressData
) => {
  const validatedData = addressSchema.parse(
    addressData
  );

  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new Error("Address not found");
  }

  if (validatedData.isDefault) {
    await Address.updateMany(
      {
        user: userId,
        _id: {
          $ne: addressId,
        },
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );
  }

  address.fullName = validatedData.fullName;
  address.phone = validatedData.phone;
  address.houseName = validatedData.houseName;
  address.street = validatedData.street;
  address.city = validatedData.city;
  address.state = validatedData.state;
  address.pincode = validatedData.pincode;
  address.country = validatedData.country;
  address.addressType = validatedData.addressType;
  address.isDefault = validatedData.isDefault;

  await address.save();

  return address;
};

// ==========================
// DELETE ADDRESS
// ==========================

export const deleteUserAddress = async (
  userId,
  addressId
) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new Error("Address not found");
  }

  const wasDefault = address.isDefault;

  await Address.deleteOne({
    _id: addressId,
    user: userId,
  });

  // If deleted address was default,
  // make the newest remaining address default
  if (wasDefault) {
    const nextAddress = await Address.findOne({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return true;
};

// ==========================
// SET DEFAULT ADDRESS
// ==========================

export const setDefaultUserAddress = async (
  userId,
  addressId
) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new Error("Address not found");
  }

  await Address.updateMany(
    {
      user: userId,
    },
    {
      $set: {
        isDefault: false,
      },
    }
  );

  address.isDefault = true;

  await address.save();

  return address;
};