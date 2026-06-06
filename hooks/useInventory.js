import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/utils/SocketContext';

/**
 * Custom hook for real-time inventory updates
 * @param {string} productId - Product ID to watch
 * @param {number} initialStock - Initial stock count
 */
export function useInventory(productId, initialStock = 0) {
  const { socket, isConnected } = useSocket();
  const [stock, setStock] = useState(initialStock);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLowStock, setIsLowStock] = useState(false);

  useEffect(() => {
    if (!socket || !productId) return;

    // Subscribe to product updates
    socket.emit('subscribe-product', productId);

    // Listen for stock updates
    const handleStockUpdate = (data) => {
      if (data.productId === productId) {
        setStock(data.newStock);
        setLastUpdate(data.timestamp);
        
        // Check if low stock (less than 5)
        if (data.newStock > 0 && data.newStock <= 5) {
          setIsLowStock(true);
        } else {
          setIsLowStock(false);
        }
      }
    };

    // Listen for sold out
    const handleSoldOut = (data) => {
      if (data.productId === productId) {
        setStock(0);
        setLastUpdate(data.timestamp);
      }
    };

    // Listen for restocked
    const handleRestocked = (data) => {
      if (data.productId === productId) {
        setStock(data.newStock);
        setLastUpdate(data.timestamp);
        setIsLowStock(false);
      }
    };

    // Listen for low stock alert
    const handleLowStock = (data) => {
      if (data.productId === productId) {
        setIsLowStock(true);
      }
    };

    socket.on('stock-updated', handleStockUpdate);
    socket.on('product-sold-out', handleSoldOut);
    socket.on('product-restocked', handleRestocked);
    socket.on('low-stock-alert', handleLowStock);

    // Cleanup
    return () => {
      socket.emit('unsubscribe-product', productId);
      socket.off('stock-updated', handleStockUpdate);
      socket.off('product-sold-out', handleSoldOut);
      socket.off('product-restocked', handleRestocked);
      socket.off('low-stock-alert', handleLowStock);
    };
  }, [socket, productId]);

  return {
    stock,
    isConnected,
    lastUpdate,
    isLowStock,
    isSoldOut: stock === 0,
  };
}

/**
 * Custom hook for category-wide inventory updates
 * @param {string} category - Category to watch
 */
export function useCategoryInventory(category) {
  const { socket, isConnected } = useSocket();
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    if (!socket || !category) return;

    socket.emit('subscribe-category', category);

    const handleStockUpdate = (data) => {
      setUpdates((prev) => [data, ...prev].slice(0, 10)); // Keep last 10 updates
    };

    socket.on('stock-updated', handleStockUpdate);

    return () => {
      socket.off('stock-updated', handleStockUpdate);
    };
  }, [socket, category]);

  return {
    updates,
    isConnected,
  };
}
