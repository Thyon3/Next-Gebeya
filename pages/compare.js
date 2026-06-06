import Layout from "@/components/Layout";
import { Store } from "@/utils/Store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import ReactStars from "react-rating-stars-component";
import { toast } from "react-toastify";
import { formatPrice } from "@/utils/currency";
import axios from "axios";

export default function CompareScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    compare: { compareItems },
    cart,
    currency,
  } = state;

  const removeFromCompareHandler = (product) => {
    dispatch({ type: "COMPARE_REMOVE_ITEM", payload: product });
    toast.success("Removed from comparison");
  };

  const clearCompareHandler = () => {
    if (confirm("Are you sure you want to clear all comparisons?")) {
      dispatch({ type: "COMPARE_CLEAR" });
      toast.success("Comparison cleared");
    }
  };

  const addToCartHandler = async (product) => {
    const existItem = cart.cartItems.find((item) => item.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      toast.error("Sorry. Product is out of stock");
      return;
    }

    dispatch({
      type: "CART_ADD_ITEM",
      payload: { ...product, quantity: quantity },
    });

    toast.success("Product added to cart");
  };

  // Comparison features to display
  const features = [
    { key: "image", label: "Product" },
    { key: "name", label: "Name" },
    { key: "price", label: "Price" },
    { key: "rating", label: "Rating" },
    { key: "brand", label: "Brand" },
    { key: "category", label: "Category" },
    { key: "stock", label: "Availability" },
    { key: "description", label: "Description" },
  ];

  return (
    <Layout title="Compare Products">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Product Comparison</h1>
        <p className="text-gray-600">
          Compare up to 4 products side by side to make the best choice
        </p>
      </div>

      {compareItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
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
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            No Products to Compare
          </h2>
          <p className="text-gray-600 mb-6">
            Add products to comparison by clicking the compare button on product cards
          </p>
          <Link href="/">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Browse Products
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Actions Bar */}
          <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              Comparing <span className="font-bold">{compareItems.length}</span>{" "}
              {compareItems.length === 1 ? "product" : "products"}
            </p>
            <button
              onClick={clearCompareHandler}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Clear All
            </button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left font-bold text-gray-700 border-r w-48">
                    Features
                  </th>
                  {compareItems.map((product) => (
                    <th
                      key={product.slug}
                      className="p-4 text-center border-r last:border-r-0 min-w-[250px]"
                    >
                      <button
                        onClick={() => removeFromCompareHandler(product)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium mb-2"
                      >
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={feature.key}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-4 font-semibold text-gray-700 border-r border-b">
                      {feature.label}
                    </td>
                    {compareItems.map((product) => (
                      <td
                        key={product.slug}
                        className="p-4 text-center border-r border-b last:border-r-0"
                      >
                        {feature.key === "image" && (
                          <Link href={`/product/${product.slug}`}>
                            <div className="relative h-48 w-full mb-2">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </Link>
                        )}
                        {feature.key === "name" && (
                          <Link href={`/product/${product.slug}`}>
                            <p className="font-semibold hover:text-blue-600 transition-colors">
                              {product.name}
                            </p>
                          </Link>
                        )}
                        {feature.key === "price" && (
                          <p className="text-2xl font-bold text-blue-600">
                            {formatPrice(product.price, currency)}
                          </p>
                        )}
                        {feature.key === "rating" && (
                          <div className="flex flex-col items-center">
                            <ReactStars
                              count={5}
                              value={product.rating}
                              size={24}
                              activeColor="#ffd700"
                              edit={false}
                            />
                            <p className="text-sm text-gray-600 mt-1">
                              ({product.numReviews} reviews)
                            </p>
                          </div>
                        )}
                        {feature.key === "brand" && (
                          <p className="text-gray-700">{product.brand}</p>
                        )}
                        {feature.key === "category" && (
                          <p className="text-gray-700">{product.category}</p>
                        )}
                        {feature.key === "stock" && (
                          <div>
                            {product.countInStock > 0 ? (
                              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                ✓ In Stock ({product.countInStock})
                              </span>
                            ) : (
                              <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                                ✗ Out of Stock
                              </span>
                            )}
                          </div>
                        )}
                        {feature.key === "description" && (
                          <p className="text-sm text-gray-600 text-left">
                            {product.description}
                          </p>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Actions Row */}
                <tr className="bg-gray-100">
                  <td className="p-4 font-semibold text-gray-700 border-r">
                    Actions
                  </td>
                  {compareItems.map((product) => (
                    <td
                      key={product.slug}
                      className="p-4 text-center border-r last:border-r-0"
                    >
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => addToCartHandler(product)}
                          disabled={product.countInStock === 0}
                          className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {product.countInStock === 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </button>
                        <Link href={`/product/${product.slug}`}>
                          <button className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add More Products */}
          {compareItems.length < 4 && (
            <div className="mt-6 text-center bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800 mb-4">
                You can add up to {4 - compareItems.length} more{" "}
                {4 - compareItems.length === 1 ? "product" : "products"} to compare
              </p>
              <Link href="/">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Browse More Products
                </button>
              </Link>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
