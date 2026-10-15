
import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";

const roundMoney = (amount) => Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

const getOrCreateWallet = async (userId, session = null) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  let walletQuery = Wallet.findOne({ user: userId });
  if (session) walletQuery = walletQuery.session(session);

  let wallet = await walletQuery;

  if (!wallet) {
    try {
      const created = await Wallet.create(
        [{ user: userId, balance: 0 }],
        session ? { session } : {}
      );
      wallet = created[0];
    } catch (error) {
      // Another request may have created the wallet concurrently.
      if (error.code !== 11000) throw error;

      let retryQuery = Wallet.findOne({ user: userId });
      if (session) retryQuery = retryQuery.session(session);
      wallet = await retryQuery;
    }
  }

  return wallet;
};

export const getWalletDetails = async (userId, page = 1, limit = 10) => {
  const wallet = await getOrCreateWallet(userId);

  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 10));

  const [transactions, total] = await Promise.all([
    WalletTransaction.find({
      user: userId,
      status: "Completed",
    })
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),

    WalletTransaction.countDocuments({
      user: userId,
      status: "Completed",
    }),
  ]);

  return {
    balance: wallet.balance,
    transactions,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

const changeWalletBalance = async ({
  userId,
  amount,
  type,
  category,
  referenceType,
  referenceId,
  description = "",
}) => {
  const normalizedAmount = roundMoney(amount);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  if (!["Credit", "Debit"].includes(type)) {
    throw new Error("Invalid wallet transaction type");
  }

  if (!referenceType || !referenceId || !category) {
    throw new Error("Transaction reference and category are required");
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const wallet = await getOrCreateWallet(userId, session);

      // Atomically update only if this reference has not already been used.
      const duplicate = await WalletTransaction.findOne({
        user: userId,
        type,
        category,
        referenceType,
        referenceId: String(referenceId),
      }).session(session);

      if (duplicate) {
        const error = new Error("This wallet transaction has already been processed");
        error.code = "WALLET_DUPLICATE_TRANSACTION";
        throw error;
      }

      const balanceFilter = {
        _id: wallet._id,
      };

      if (type === "Debit") {
        balanceFilter.balance = { $gte: normalizedAmount };
      }

      const balanceChange =
        type === "Credit" ? normalizedAmount : -normalizedAmount;

      const updatedWallet = await Wallet.findOneAndUpdate(
        balanceFilter,
        { $inc: { balance: balanceChange } },
        { new: true, session, runValidators: true }
      );

      if (!updatedWallet) {
        const error = new Error("Insufficient wallet balance");
        error.code = "WALLET_INSUFFICIENT_BALANCE";
        throw error;
      }

      const [transaction] = await WalletTransaction.create(
        [
          {
            wallet: updatedWallet._id,
            user: userId,
            type,
            category,
            amount: normalizedAmount,
            balanceAfter: updatedWallet.balance,
            description,
            referenceType,
            referenceId: String(referenceId),
            status: "Completed",
          },
        ],
        { session }
      );

      result = {
        balance: updatedWallet.balance,
        transaction,
      };
    });

    return result;
  } catch (error) {
    // The unique transaction index also protects against concurrent requests.
    if (error.code === 11000) {
      const duplicateError = new Error(
        "This wallet transaction has already been processed"
      );
      duplicateError.code = "WALLET_DUPLICATE_TRANSACTION";
      throw duplicateError;
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export const creditWallet = async ({
  userId,
  amount,
  category,
  referenceType,
  referenceId,
  description,
}) => {
  if (!["Cancellation Refund", "Return Refund", "Admin Credit", "Adjustment"].includes(category)) {
    throw new Error("This category cannot credit the wallet");
  }

  return changeWalletBalance({
    userId,
    amount,
    type: "Credit",
    category,
    referenceType,
    referenceId,
    description,
  });
};

export const debitWallet = async ({
  userId,
  amount,
  category = "Order Payment",
  referenceType = "Order",
  referenceId,
  description,
}) => {
  if (category !== "Order Payment" && category !== "Adjustment") {
    throw new Error("This category cannot debit the wallet");
  }

  return changeWalletBalance({
    userId,
    amount,
    type: "Debit",
    category,
    referenceType,
    referenceId,
    description,
  });
};