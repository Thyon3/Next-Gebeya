import React, { useEffect, useReducer, useContext } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getError } from "@/utils/error";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Store } from "@/utils/Store";
import { formatPrice } from "@/utils/currency";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAY_FAIL":
      return { ...state, loadingPay: false };
    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false };
    default:
      return state;
  }
}

export default function AdminOrderDetail() {
  const { state } = useContext(Store);
  const { currency } = state;
  const router = useRouter();
  const { id: orderId } = router.query;

  const [
    { loading, error, order, successPay, successDeliver, loadingPay, loadingDeliver },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/orders/${orderId}`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (orderId && (!order._id || successPay || successDeliver || (order._id && order._id !== orderId))) {
      fetchOrder();
    }
  }, [order, orderId, successPay, successDeliver]);

  const markAsPaidHandler = async () => {
    if (!window.confirm("Are you sure you want to mark this order as paid?")) {
      return;
    }
    try {
      dispatch({ type: "PAY_REQUEST" });
      await axios.put(`/api/admin/orders/${orderId}/pay`);
      dispatch({ type: "PAY_SUCCESS" });
      toast.success("Order marked as paid successfully");
    } catch (err) {
      dispatch({ type: "PAY_FAIL" });
      toast.error(getError(err));
    }
  };

  const markAsDeliveredHandler = async () => {
    if (!window.confirm("Are you sure you want to mark this order as delivered?")) {
      return;
    }
    try {
      dispatch({ type: "DELIVER_REQUEST" });
      await axios.put(`/api/admin/orders/${orderId}/deliver`);
      dispatch({ type: "DELIVER_SUCCESS" });
      toast.success("Order marked as delivered successfully");
    } catch (err) {
      dispatch({ type: "DELIVER_FAIL" });
      toast.error(getError(err));
    }
  };

  return (
    <AdminLayout title={`Order ${orderId}`}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Order Details: {orderId?.substring(20, 24)}
        </h1>
        <Link href="/admin/orders">
          <button className="default-button">
            ← Back to Orders
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <div className="card p-5 mb-5">
              <h2 className="mb-3 text-lg font-bold">Customer Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Name:</span>{" "}
                  {order.user ? order.user.name : "DELETED USER"}
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  {order.user ? order.user.email : "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Order Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="card p-5 mb-5">
              <h2 className="mb-3 text-lg font-bold">Shipping Address</h2>
              <div className="mb-3">
                {order.shippingAddress.fullName}, {order.shippingAddress.address},{" "}
                {order.shippingAddress.city}, {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </div>
              {order.isDelivered ? (
                <div className="alert-success">
                  Delivered at {new Date(order.deliveredAt).toLocaleString()}
                </div>
              ) : (
                <div className="alert-error">Not delivered</div>
              )}
            </div>

            <div className="card p-5 mb-5">
              <h2 className="mb-3 text-lg font-bold">Payment Method</h2>
              <div className="mb-3">{order.paymentMethod}</div>
              {order.isPaid ? (
                <div className="alert-success">
                  Paid at {new Date(order.paidAt).toLocaleString()}
                </div>
              ) : (
                <div className="alert-error">Not paid</div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="mb-3 text-lg font-bold">Order Items</h2>
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
                  {order.orderItems && order.orderItems.map((item, index) => (
                    <tr key={item._id || index} className="border-b">
                      <td>
                        {item.slug ? (
                          <Link href={`/product/${item.slug}`}>
                            <span className="flex items-center cursor-pointer hover:text-blue-600 transition-colors">
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={50}
                                height={50}
                                className="rounded-sm"
                              />
                              <span className="ml-3">{item.name}</span>
                            </span>
                          </Link>
                        ) : (
                          <span className="flex items-center">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={50}
                              height={50}
                              className="rounded-sm"
                            />
                            <span className="ml-3">{item.name}</span>
                          </span>
                        )}
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
            </div>
          </div>

          <div>
            <div className="card p-5 mb-5">
              <h2 className="mb-3 text-lg font-bold">Order Summary</h2>
              <ul className="space-y-2">
                <li>
                  <div className="flex justify-between">
                    <div>Items</div>
                    <div>{formatPrice(order.itemsPrice, currency)}</div>
                  </div>
                </li>
                <li>
                  <div className="flex justify-between">
                    <div>Tax</div>
                    <div>{formatPrice(order.taxPrice, currency)}</div>
                  </div>
                </li>
                <li>
                  <div className="flex justify-between">
                    <div>Shipping</div>
                    <div>{formatPrice(order.shippingPrice, currency)}</div>
                  </div>
                </li>
                <li className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <div>Total</div>
                    <div className="text-blue-600">{formatPrice(order.totalPrice, currency)}</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="mb-3 text-lg font-bold">Admin Actions</h2>
              <div className="space-y-3">
                {!order.isPaid && (
                  <button
                    onClick={markAsPaidHandler}
                    disabled={loadingPay}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingPay ? "Processing..." : "Mark as Paid"}
                  </button>
                )}
                {!order.isDelivered && (
                  <button
                    onClick={markAsDeliveredHandler}
                    disabled={loadingDeliver || !order.isPaid}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!order.isPaid ? "Order must be paid first" : "Mark as delivered"}
                  >
                    {loadingDeliver ? "Processing..." : "Mark as Delivered"}
                  </button>
                )}
                {order.isPaid && order.isDelivered && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-center">
                    <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                      ✓ Order Complete
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

AdminOrderDetail.auth = { adminOnly: true };
