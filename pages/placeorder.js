import CheckoutWizard from "@/components/CheckoutWizard";
import Layout from "@/components/Layout";
import { getError } from "@/utils/error";
import { Store } from "@/utils/Store";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { formatPrice } from "@/utils/currency";

export default function PlaceOrder() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { cart, currency } = state;
  const { cartItems, shippingAddress, paymentMethod, coupon } = cart;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  const itemsPrice = round2(
    cartItems.reduce((total, item) => total + item.quantity * item.price, 0)
  );

  // Apply coupon discount
  const discountAmount = coupon ? round2(coupon.discountAmount) : 0;

  const shippingPrice = itemsPrice > 200 ? 0 : 15;
  const taxPrice = round2((itemsPrice - discountAmount) * 0.15);
  const totalPrice = round2(itemsPrice - discountAmount + shippingPrice + taxPrice);

  useEffect(() => {
    if (!paymentMethod) {
      router.push("/payment");
    }
  }, [paymentMethod, router]);

  const [loading, setLoading] = useState(false);

  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/orders", {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        couponCode: coupon?.code || null,
        discountAmount: discountAmount,
      });

      // Mark coupon as used if applied
      if (coupon?.code) {
        try {
          await axios.post('/api/coupons/mark-used', {
            code: coupon.code,
          });
        } catch (error) {
          console.error('Error marking coupon as used:', error);
        }
      }

      setLoading(false);
      dispatch({ type: "CART_CLEAR_ITEMS" });
      dispatch({ type: "CART_REMOVE_COUPON" });
      Cookies.set(
        "cart",
        JSON.stringify({
          ...cart,
          cartItems: [],
          coupon: null,
        })
      );
      router.push(`/order/${data._id}`);
    } catch (error) {
      setLoading(false);
      toast.error(getError(error));
    }
  };

  return (
    <Layout title="Place Order">
      <CheckoutWizard activeStep={3} />
      <h1 className="mb-4 text-3xl font-bold">Place Order</h1>
      {cartItems.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-xl mb-4">Cart is empty</p>
          <Link href="/">
            <button className="primary-button">Go Shopping</button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <div className="card p-5 mb-5">
              <h2 className="mb-2 text-lg font-bold">Shipping Address</h2>
              <div>
                {shippingAddress.fullName}, {shippingAddress.address},{" "}
                {shippingAddress.city}, {shippingAddress.postalCode},{" "}
                {shippingAddress.country}
              </div>
              <div>
                <Link href="/shipping" className="text-blue-600">
                  Edit
                </Link>
              </div>
            </div>

            <div className="card p-5 mb-5">
              <h2 className="mb-2 text-lg font-bold">Payment Method</h2>
              <div>{paymentMethod}</div>
              <div>
                <Link href="/payment" className="text-blue-600">
                  Edit
                </Link>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="mb-2 text-lg font-bold">Order Items</h2>
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-5 text-left">Item</th>
                    <th className="px-5 text-right">Quantity</th>
                    <th className="px-5 text-right">Price</th>
                    <th className="px-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id} className="border-b">
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
                      <td className="p-5 text-right">{item.quantity}</td>
                      <td className="p-5 text-right">{formatPrice(item.price, currency)}</td>
                      <td className="p-5 text-right">
                        {formatPrice(item.quantity * item.price, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <Link href="/cart" className="text-blue-600">
                  Edit
                </Link>
              </div>
            </div>
          </div>

          <div>
            <div className="card p-5">
              <h2 className="mb-2 text-lg font-bold">Order Summary</h2>
              <ul className="space-y-2">
                <li>
                  <div className="flex justify-between">
                    <div>Items</div>
                    <div>{formatPrice(itemsPrice, currency)}</div>
                  </div>
                </li>
                {coupon && (
                  <li>
                    <div className="flex justify-between text-green-600 font-semibold">
                      <div>Discount ({coupon.code})</div>
                      <div>-{formatPrice(discountAmount, currency)}</div>
                    </div>
                  </li>
                )}
                <li>
                  <div className="flex justify-between">
                    <div>Tax</div>
                    <div>{formatPrice(taxPrice, currency)}</div>
                  </div>
                </li>
                <li>
                  <div className="flex justify-between">
                    <div>Shipping</div>
                    <div>{formatPrice(shippingPrice, currency)}</div>
                  </div>
                </li>
                <li className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <div>Total</div>
                    <div className="text-blue-600">{formatPrice(totalPrice, currency)}</div>
                  </div>
                </li>
                <li>
                  <button
                    disabled={loading}
                    onClick={placeOrderHandler}
                    className="primary-button w-full"
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

PlaceOrder.auth = true;
