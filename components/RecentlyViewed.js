import React, { useState, useEffect, useContext } from 'react';
import { getRecentlyViewed } from '@/utils/recentlyViewed';
import ProductItem from './ProductItem';
import { Store } from '@/utils/Store';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function RecentlyViewed({ currentProductSlug = null, limit = 12 }) {
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoading(true);
        
        // Get product IDs from localStorage
        let storedProducts = getRecentlyViewed();
        
        // Filter out current product if on product detail page
        if (currentProductSlug) {
          storedProducts = storedProducts.filter(p => p.slug !== currentProductSlug);
        }
        
        // Apply limit
        if (limit) {
          storedProducts = storedProducts.slice(0, limit);
        }
        
        // If no stored products, return empty
        if (storedProducts.length === 0) {
          setRecentProducts([]);
          setLoading(false);
          return;
        }
        
        // Fetch fresh product data from API for each product
        const productPromises = storedProducts.map(async (storedProduct) => {
          try {
            const { data } = await axios.get(`/api/products/${storedProduct._id}`);
            return data;
          } catch (error) {
            console.error(`Error fetching product ${storedProduct._id}:`, error);
            // Fallback to stored data if API fails
            return storedProduct;
          }
        });
        
        const freshProducts = await Promise.all(productPromises);
        
        setRecentProducts(freshProducts);
      } catch (error) {
        console.error('Error loading recently viewed:', error);
        setRecentProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, [currentProductSlug, limit]);

  const addToCartHandler = async (product) => {
    const existItem = cart.cartItems.find((item) => item.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      toast.error('Sorry. Product is out of stock');
      return;
    }

    dispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity: quantity },
    });

    toast.success('Product added to the cart');
  };

  // Don't render if no products
  if (loading) {
    return (
      <div className="my-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Recently Viewed</h2>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-none w-72">
              <div className="card animate-pulse">
                <div className="bg-gray-200 h-64 rounded"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Recently Viewed</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{recentProducts.length} {recentProducts.length === 1 ? 'product' : 'products'}</span>
        </div>
      </div>
      
      {/* Horizontal scroll container */}
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {recentProducts.map((product) => (
            <div 
              key={product.slug} 
              className="flex-none w-72 snap-start"
            >
              <ProductItem
                product={product}
                addToCartHandler={addToCartHandler}
                allProducts={recentProducts}
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
