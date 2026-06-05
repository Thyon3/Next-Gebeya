import Layout from "@/components/Layout";
import { getError } from "@/utils/error";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useReducer } from "react";
import { SkeletonTable } from "@/components/skeletons";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, orders: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

function OrderHistory() {
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: "",
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/history`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchOrders();
  }, []);

  return (
    <Layout title="Order History">
      <h1 className="mb-4 text-3xl font-bold">Order History</h1>
      {loading ? (
        <SkeletonTable rows={5} columns={6} />
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b">
              <tr>
                <th className="px-5 text-left">ID</th>
                <th className="px-5 text-left">DATE</th>
                <th className="px-5 text-left">TOTAL</th>
                <th className="px-5 text-left">PAID</th>
                <th className="px-5 text-left">DELIVERED</th>
                <th className="px-5 text-left">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="p-5">{order._id.substring(20, 24)}</td>
                  <td className="p-5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-5">${order.totalPrice}</td>
                  <td className="p-5">
                    {order.isPaid ? (
                      <span className="text-green-600">
                        {new Date(order.paidAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-red-600">Not paid</span>
                    )}
                  </td>
                  <td className="p-5">
                    {order.isDelivered ? (
                      <span className="text-green-600">
                        {new Date(order.deliveredAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-red-600">Not delivered</span>
                    )}
                  </td>
                  <td className="p-5">
                    <Link href={`/order/${order._id}`} passHref>
                      <button className="primary-button">Details</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

OrderHistory.auth = true;

export default OrderHistory;
