import React from 'react';

export default function LiveStockBadge({ stock, isConnected, isLowStock, isSoldOut, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  if (isSoldOut) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-700 font-semibold ${sizeClasses[size]}`}>
        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
        Out of Stock
      </span>
    );
  }

  if (isLowStock) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-700 font-semibold ${sizeClasses[size]}`}>
        {isConnected && (
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
        )}
        Only {stock} left
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-700 font-semibold ${sizeClasses[size]}`}>
      {isConnected && (
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      )}
      In Stock
    </span>
  );
}
