
import { getWalletDetails } from "../services/walletService.js";

export const getMyWallet = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to view your wallet",
      });
    }

    const { page = 1, limit = 10 } = req.query;

    const wallet = await getWalletDetails(userId, page, limit);

    return res.status(200).json({
      success: true,
      message: "Wallet retrieved successfully",
      data: wallet,
    });
  } catch (error) {
    console.error("GET WALLET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve wallet details",
    });
  }
};