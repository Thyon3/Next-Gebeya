// Socket.IO utility for emitting events from API routes

/**
 * Emit stock update event to all clients watching a product
 * @param {string} productId - Product ID
 * @param {object} data - Stock update data
 */
export function emitStockUpdate(productId, data) {
  if (global.io) {
    const room = `product-${productId}`;
    global.io.to(room).emit('stock-updated', {
      productId,
      ...data,
      timestamp: new Date().toISOString(),
    });
    console.log(`📢 Emitted stock-updated to ${room}:`, data);
  }
}

/**
 * Emit product sold out event
 * @param {string} productId - Product ID
 * @param {object} productData - Product information
 */
export function emitProductSoldOut(productId, productData) {
  if (global.io) {
    const room = `product-${productId}`;
    global.io.to(room).emit('product-sold-out', {
      productId,
      ...productData,
      timestamp: new Date().toISOString(),
    });
    console.log(`🚫 Emitted product-sold-out to ${room}`);
  }
}

/**
 * Emit product restocked event
 * @param {string} productId - Product ID
 * @param {object} productData - Product information
 */
export function emitProductRestocked(productId, productData) {
  if (global.io) {
    const room = `product-${productId}`;
    global.io.to(room).emit('product-restocked', {
      productId,
      ...productData,
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Emitted product-restocked to ${room}`);
  }
}

/**
 * Emit low stock alert
 * @param {string} productId - Product ID
 * @param {object} productData - Product information
 */
export function emitLowStockAlert(productId, productData) {
  if (global.io) {
    const room = `product-${productId}`;
    global.io.to(room).emit('low-stock-alert', {
      productId,
      ...productData,
      timestamp: new Date().toISOString(),
    });
    console.log(`⚠️ Emitted low-stock-alert to ${room}`);
  }
}

/**
 * Get active connections count
 */
export function getActiveConnectionsCount() {
  if (global.io) {
    return global.io.engine.clientsCount;
  }
  return 0;
}
