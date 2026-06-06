import Layout from "@/components/Layout";
import { Store } from "@/utils/Store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/utils/currency";

export default function WishlistScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    wishlist: { wishlistItems },
    currency,
  } = state;

  const removeItemHandler = (item) => {
    dispatch({ type: "WISHLIST_REMOVE_ITEM", payload: item });
  };

  const addToCartHandler = async (product) => {
    const { data } = await fetch(`/api/products/${product._id}`).then((res) =>
      res.json()
    );

    if (data.countInStock > 0) {
      dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity: 1 } });
      router.push("/cart");
    } else {
      alert("Sorry. Product is out of stock");
    }
  };

  const clearWishlistHandler = () => {
    if (confirm("Are you sure you want to clear your wishlist?")) {
      dispatch({ type: "WISHLIST_CLEAR" });
    }
  };

  return (
    <Layout title="Wishlist">
      <h1 className="mb-4 text-3xl font-bold">Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <p className="text-xl text-gray-600 mb-4">Your wishlist is empty</p>
          <Link href="/">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Continue Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} in your wishlist
            </p>
            <button
              onClick={clearWishlistHandler}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear Wishlist
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((item) => (
              <div
                key={item.slug}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow relative"
              >
                <button
                  onClick={() => removeItemHandler(item)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 z-10"
                  aria-label="Remove from wishlist"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>

                <Link href={`/product/${item.slug}`}>
                  <div className="relative h-48 mb-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </Link>

                <Link href={`/product/${item.slug}`}>
                  <h2 className="text-lg font-semibold mb-2 hover:text-blue-600 line-clamp-2">
                    {item.name}
                  </h2>
                </Link>

                <p className="text-gray-600 mb-1">{item.brand}</p>
                <p className="text-xl font-bold text-blue-600 mb-3">
                  {formatPrice(item.price, currency)}
                </p>

                {item.countInStock > 0 ? (
                  <button
                    onClick={() => addToCartHandler(item)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
