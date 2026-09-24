import mongoose from "mongoose";
import Product from "../models/Product.js";

const LOW_STOCK_LIMIT = 5;

/*
|--------------------------------------------------------------------------
| GET STOCK STATUS
|--------------------------------------------------------------------------
*/

const getStockStatus = (stock) => {
  if (stock <= 0) {
    return "Out of Stock";
  }

  if (stock <= LOW_STOCK_LIMIT) {
    return "Low Stock";
  }

  return "In Stock";
};

/*
|--------------------------------------------------------------------------
| GET TOTAL STOCK
|--------------------------------------------------------------------------
*/

const getTotalStock = (product) => {
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes.reduce(
      (total, item) => total + (Number(item.stock) || 0),
      0,
    );
  }

  return Number(product.stock) || 0;
};

/*
|--------------------------------------------------------------------------
| GET INVENTORY
|--------------------------------------------------------------------------
*/

const getInventory = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
}) => {
  const currentPage = Math.max(Number(page) || 1, 1);

  const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

  const skip = (currentPage - 1) * currentLimit;

  const query = {
    isDeleted: false,
  };

  if (search.trim()) {
    query.name = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  const products = await Product.find(query)
    .populate("category", "name")
    .populate("subcategory", "name")
    .sort({ createdAt: -1 })
    .lean();

  const inventory = products.map((product) => {
    const totalStock = getTotalStock(product);

    return {
      _id: product._id,
      name: product.name,
      images: product.images || [],
      category: product.category,
      subcategory: product.subcategory,
      isActive: product.isActive,
      sizes: product.sizes || [],
      stock: totalStock,
      stockStatus: getStockStatus(totalStock),
      createdAt: product.createdAt,
    };
  });

  const filteredInventory = status
    ? inventory.filter((product) => product.stockStatus === status)
    : inventory;

  const totalProducts = filteredInventory.length;

  const paginatedProducts = filteredInventory.slice(skip, skip + currentLimit);

  const totalPages = Math.ceil(totalProducts / currentLimit);

  const totalUnits = inventory.reduce(
    (total, product) => total + product.stock,
    0,
  );

  const lowStockProducts = inventory.filter(
    (product) => product.stock > 0 && product.stock <= LOW_STOCK_LIMIT,
  ).length;

  const outOfStockProducts = inventory.filter(
    (product) => product.stock <= 0,
  ).length;

  return {
    products: paginatedProducts,

    stats: {
      totalProducts: inventory.length,
      totalUnits,
      lowStockProducts,
      outOfStockProducts,
    },

    pagination: {
      currentPage,
      totalPages,
      totalProducts,
      limit: currentLimit,
    },
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT STOCK
|--------------------------------------------------------------------------
*/

const updateInventoryStock = async (productId, { sizes, stock }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new Error("Product not found");
  }

  /*
  |--------------------------------------------------------------------------
  | SIZE-BASED PRODUCT
  |--------------------------------------------------------------------------
  */

  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    if (!Array.isArray(sizes)) {
      throw new Error("Size stock data is required");
    }

    if (sizes.length !== product.sizes.length) {
      throw new Error("All existing product sizes must be provided");
    }

    const submittedSizes = new Map();

    for (const item of sizes) {
      if (!item?.size) {
        throw new Error("Size is required");
      }

      const numericStock = Number(item.stock);

      if (!Number.isInteger(numericStock) || numericStock < 0) {
        throw new Error(`Invalid stock for size ${item.size}`);
      }

      if (submittedSizes.has(item.size)) {
        throw new Error(`Duplicate size ${item.size}`);
      }

      submittedSizes.set(item.size, numericStock);
    }

    for (const productSize of product.sizes) {
      if (!submittedSizes.has(productSize.size)) {
        throw new Error(`Stock for size ${productSize.size} is required`);
      }

      productSize.stock = submittedSizes.get(productSize.size);
    }

    /*
     * Keep total product stock
     * synchronized with size stock.
     */

    product.stock = product.sizes.reduce(
      (total, item) => total + Number(item.stock || 0),
      0,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PRODUCT WITHOUT SIZES
  |--------------------------------------------------------------------------
  */
  else {
    const numericStock = Number(stock);

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      throw new Error("Stock must be a non-negative integer");
    }

    product.stock = numericStock;
  }

  await product.save();

  return {
    _id: product._id,
    name: product.name,
    sizes: product.sizes || [],
    stock: product.stock,
    stockStatus: getStockStatus(product.stock),
  };
};

export { getInventory, updateInventoryStock };
