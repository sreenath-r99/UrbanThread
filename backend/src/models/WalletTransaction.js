
import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["Credit", "Debit"],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Cancellation Refund",
        "Return Refund",
        "Order Payment",
        "Admin Credit",
        "Adjustment",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
      set: (value) => Math.round(Number(value) * 100) / 100,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    referenceType: {
      type: String,
      enum: ["Order", "OrderItem", "Manual"],
      required: true,
    },

    referenceId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Completed", "Failed"],
      default: "Completed",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same credit/debit reference from being recorded twice.
walletTransactionSchema.index(
  {
    user: 1,
    type: 1,
    category: 1,
    referenceType: 1,
    referenceId: 1,
  },
  {
    unique: true,
  }
);

walletTransactionSchema.index({
  user: 1,
  createdAt: -1,
});

const WalletTransaction = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);

export default WalletTransaction;