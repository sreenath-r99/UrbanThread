import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productImage: {
      type: String,
      default: "",
      trim: true,
    },

    size: {
      type: String,
      enum: {
        values: ["S", "M", "L", "XL", "XXL"],
        message: "Size must be S, M, L, XL, or XXL",
      },
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },

    itemTotal: {
      type: Number,
      required: true,
      min: [0, "Item total cannot be negative"],
    },

    /*
     * ---------------------------------------------------------
     * ITEM CANCELLATION
     * ---------------------------------------------------------
     */

    itemStatus: {
      type: String,
      enum: ["Active", "Cancelled"],
      default: "Active",
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
  },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    houseName: {
      type: String,
      required: true,
      trim: true,
    },

    street: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },

    addressType: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD"],
      required: true,
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Partially Cancelled",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },

    /*
     * ---------------------------------------------------------
     * COUPON
     * ---------------------------------------------------------
     */

    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    couponDiscount: {
      type: Number,
      default: 0,
      min: [0, "Coupon discount cannot be negative"],
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: [0, "Shipping charge cannot be negative"],
    },

    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },

    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
