import Layout from "@/components/Layout";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { Store } from "@/utils/Store";
import Link from "next/link";
import React, { useContext, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import axios from "axios";
import { toast } from "react-toastify";
import { formatPrice } from "@/utils/currency";
import { useAuth } from "@/utils/AuthContext";
import { SkeletonCartItem } from "@/components/skeletons";

function Cart() {
  const router = useRouter();
  const { user: session, loading: status } = useAuth();
  const { state, dispatch } = useContext(Store);
  const [isLoading, setIsLoading] = useState(true);

  const {
    cart: { cartItems, coupon },
    currency,
  } = state;

  const [couponCode, setCouponCode] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const removeItemHandler = (item) => {
    dispatch({ type: "CART_REMOVE_ITEM", payload: item });
    toast.success("Product removed from cart");
  };

  const updateCartHandler = async (item, qty) => {
    const quantity = Number(qty);
    const { data } = await axios.get(`/api/products/${item._id}`);

    if (data.countInStock < quantity) {
      toast.error("Sorry. Product is out of stock");
      return;
    }

    dispatch({
      type: "CART_ADD_ITEM",
      payload: { ...item, quantity: quantity },
    });

    toast.success("Cart updated");
  };

  const applyCouponHandler = async () => {
    if (status === 'loading') {
      toast.info('Please wait...');
      return;
    }

    if (!session || status === 'unauthenticated') {
      toast.error('Please sign in to use coupons');
      router.push('/login?redirect=/cart');
      return;
    }

    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoadingCoupon(true);
    try {
      const subtotal = cartItems.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      );

      const { data } = await axios.post('/api/coupons/apply', {
        code: couponCode.trim(),
        cartTotal: subtotal,
      });

      dispatch({
        type: 'CART_APPLY_COUPON',
        payload: {
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          discountAmount: data.discount,
          maxUsagePerProduct: data.coupon.maxUsagePerProduct,
        },
      });

      toast.success(`Coupon applied! You saved ${formatPrice(data.discount, currency)}`);
      setCouponCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const removeCouponHandler = () => {
    dispatch({ type: 'CART_REMOVE_COUPON' });
    toast.success('Coupon removed');
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  const discountAmount = coupon ? coupon.discountAmount : 0;
  const total = subtotal - discountAmount;

  return (
    <Layout title="Shopping Cart">
      <h1 className="mb-4 text-3xl font-bold">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Link href="/">
            <button className="primary-button">Continue Shopping</button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-5 text-left">Item</th>
                  <th className="px-5 text-right">Quantity</th>
                  <th className="px-5 text-right">Price</th>
                  <th className="px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="4" className="p-5">
                        <SkeletonCartItem />
                      </td>
                    </tr>
                  ))
                ) : (
                  cartItems.map((item) => (
                    <tr key={item.slug} className="border-b">
                      <td>
                        <Link href={`/product/${item.slug}`}>
                          <span className="flex items-center">
                            <Image
                              className="rounded-sm"
                              src={item.image}
                              alt={item.name}
                              width={50}
                              height={50}
                            />
                            <span className="ml-3">{item.name}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="p-5 text-right">
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartHandler(item, e.target.value)
                          }
                          className="rounded border p-2"
                        >
                          {[...Array(item.countInStock).keys()].map((num) => (
                            <option key={num + 1} value={num + 1}>
                              {num + 1}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-5 text-right font-semibold">{formatPrice(item.price, currency)}</td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => removeItemHandler(item)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XCircleIcon className="h-6 w-6" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="card p-5 h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {/* Coupon Section */}
            {session && (
              <div className="mb-4 pb-4 border-b">
                <label className="block text-sm font-semibold mb-2">
                  Have a coupon code?
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Logged in as: {session.user.email} (Status: {status})
                </div>
                {!coupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border rounded-lg"
                      disabled={loadingCoupon}
                    />
                    <button
                      onClick={applyCouponHandler}
                      disabled={loadingCoupon || !couponCode.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loadingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="w-5 h-5 text-green-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <p className="font-semibold text-green-800">
                            Coupon "{coupon.code}" applied!
                          </p>
                          <p className="text-sm text-green-600">
                            You saved {formatPrice(discountAmount, currency)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeCouponHandler}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <ul className="space-y-3">
              <li>
                <div className="flex justify-between text-lg">
                  <div>Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} items)</div>
                  <div>{formatPrice(subtotal, currency)}</div>
                </div>
              </li>
              {coupon && (
                <li>
                  <div className="flex justify-between text-green-600 font-semibold">
                    <div>Discount ({coupon.discountValue}%)</div>
                    <div>-{formatPrice(discountAmount, currency)}</div>
                  </div>
                </li>
              )}
              <li className="border-t pt-3">
                <div className="flex justify-between text-2xl font-bold">
                  <div>Total</div>
                  <div className="text-blue-600">
                    {formatPrice(total, currency)}
                  </div>
                </div>
              </li>
              <li>
                <button
                  onClick={() => router.push("login?redirect=/shipping")}
                  className="primary-button w-full"
                >
                  Proceed to Checkout
                </button>
              </li>
              <li>
                <Link href="/">
                  <button className="default-button w-full">
                    Continue Shopping
                  </button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(Cart), { ssr: false });
