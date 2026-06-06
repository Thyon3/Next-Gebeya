import Order from "@/models/Order";
import mongoose from "mongoose";

/**
 * Calculate sold count for a product from paid orders
 * @param {string|ObjectId} productId - The product ID
 * @returns {Promise<number>} - Total quantity sold
 */
export async function calculateSoldCount(productId) {
  try {
    const productObjectId = productId instanceof mongoose.Types.ObjectId 
      ? productId 
      : new mongoose.Types.ObjectId(productId);

    // Aggregate sold count from all paid orders
    const result = await Order.aggregate([
      // Match only paid orders
      { $match: { isPaid: true } },
      // Unwind order items array
      { $unwind: "$orderItems" },
      // Match items for this product (by _id, slug, or name)
      {
        $match: {
          $or: [
            { "orderItems._id": productObjectId },
            { "orderItems._id": productId.toString() }
          ]
        }
      },
      // Sum up quantities
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$orderItems.quantity" }
        }
      }
    ]);

    return result.length > 0 ? result[0].totalSold : 0;
  } catch (error) {
    console.error('Error calculating sold count:', error);
    return 0;
  }
}

/**
 * Calculate sold counts for multiple products
 * @param {Array<Object>} products - Array of product objects
 * @returns {Promise<Array<Object>>} - Products with soldCount added
 */
export async function addSoldCountsToProducts(products) {
  try {
    if (!products || products.length === 0) return products;

    // Get all product IDs
    const productIds = products.map(p => {
      if (p._id instanceof mongoose.Types.ObjectId) {
        return p._id;
      }
      return new mongoose.Types.ObjectId(p._id);
    });

    // Aggregate sold counts for all products at once
    const soldCounts = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$orderItems" },
      {
        $match: {
          $or: [
            { "orderItems._id": { $in: productIds } },
            { "orderItems._id": { $in: productIds.map(id => id.toString()) } }
          ]
        }
      },
      {
        $group: {
          _id: "$orderItems._id",
          totalSold: { $sum: "$orderItems.quantity" }
        }
      }
    ]);

    // Create a map of productId -> soldCount
    const soldCountMap = {};
    soldCounts.forEach(item => {
      const idStr = item._id.toString();
      soldCountMap[idStr] = item.totalSold;
    });

    // Add soldCount to each product
    return products.map(product => {
      const productIdStr = product._id.toString();
      return {
        ...product,
        soldCount: soldCountMap[productIdStr] || 0
      };
    });
  } catch (error) {
    console.error('Error adding sold counts to products:', error);
    return products.map(p => ({ ...p, soldCount: 0 }));
  }
}
