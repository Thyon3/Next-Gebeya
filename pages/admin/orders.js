import AdminLayout from "@/components/AdminLayout";
import { getError } from "@/utils/error";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useReducer } from "react";
import { SkeletonTable } from "@/components/skeletons";
import { toast } from "react-toastify";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, orders: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false };
    case "PAY_FAIL":
      return { ...state, loadingPay: false };
    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false };
    default:
      return state;
  }
}

export default function AdminOrders() {
  const [{ loading, error, orders, loadingPay, loadingDeliver }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: "",
    loadingPay: false,
    loadingDeliver: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/orders`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  const markAsPaidHandler = async (orderId) => {
    if (!window.confirm("Are you sure you want to mark this order as paid?")) {
      return;
    }
    try {
      dispatch({ type: "PAY_REQUEST" });
      await axios.put(`/api/admin/orders/${orderId}/pay`);
      dispatch({ type: "PAY_SUCCESS" });
      toast.success("Order marked as paid successfully");
      // Refresh orders
      const { data } = await axios.get(`/api/admin/orders`);
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "PAY_FAIL" });
      toast.error(getError(err));
    }
  };

  const markAsDeliveredHandler = async (orderId) => {
    if (!window.confirm("Are you sure you want to mark this order as delivered?")) {
      return;
    }
    try {
      dispatch({ type: "DELIVER_REQUEST" });
      await axios.put(`/api/admin/orders/${orderId}/deliver`);
      dispatch({ type: "DELIVER_SUCCESS" });
      toast.success("Order marked as delivered successfully");
      // Refresh orders
      const { data } = await axios.get(`/api/admin/orders`);
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "DELIVER_FAIL" });
      toast.error(getError(err));
    }
  };

  return (
    <AdminLayout title="Orders Management">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Orders Management</h1>
      {loading ? (
        <SkeletonTable rows={10} columns={7} />
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b">
              <tr>
                <th className="px-5 text-left">ID</th>
                <th className="px-5 text-left">USER</th>
                <th className="px-5 text-left">DATE</th>
                <th className="px-5 text-left">TOTAL</th>
                <th className="px-5 text-left">PAID</th>
                <th className="px-5 text-left">DELIVERED</th>
                <th className="px-5 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="p-5">{order._id.substring(20, 24)}</td>
                  <td className="p-5">
                    {order.user ? order.user.name : "DELETED USER"}
                  </td>
                  <td className="p-5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-5">${order.totalPrice}</td>
                  <td className="p-5">
                    {order.isPaid ? (
                      <div className="flex flex-col">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300">
                          ✓ Paid
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(order.paidAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300">
                          ✗ Not paid
                        </span>
                        <button
                          onClick={() => markAsPaidHandler(order._id)}
                          disabled={loadingPay}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingPay ? "Processing..." : "Mark as Paid"}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-5">
                    {order.isDelivered ? (
                      <div className="flex flex-col">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300">
                          ✓ Delivered
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(order.deliveredAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300">
                          ⏳ Pending
                        </span>
                        <button
                          onClick={() => markAsDeliveredHandler(order._id)}
                          disabled={loadingDeliver || !order.isPaid}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!order.isPaid ? "Order must be paid first" : "Mark as delivered"}
                        >
                          {loadingDeliver ? "Processing..." : "Mark as Delivered"}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-5">
                    <Link href={`/admin/order-detail?id=${order._id}`} passHref>
                      <button className="primary-button">Details</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )}
        </AdminLayout>
  );
}

AdminOrders.auth = { adminOnly: true };
