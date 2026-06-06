import AdminLayout from "@/components/AdminLayout";
import { getError } from "@/utils/error";
import axios from "axios";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import Link from "next/link";
import React, { useEffect, useReducer } from "react";
import { Bar } from "react-chartjs-2";
import { SkeletonStats } from "@/components/skeletons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, summary: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "FETCH_NOTIFICATIONS_SUCCESS":
      return { ...state, notificationStats: action.payload };
    default:
      return state;
  }
}

export default function Dashboard() {
  const [{ loading, error, summary, notificationStats }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: { salesDate: [] },
    notificationStats: null,
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get("/api/admin/summary");
        dispatch({ type: "FETCH_SUCCESS", payload: data });
        
        // Fetch notification stats
        try {
          const { data: notifData } = await axios.get("/api/stock-notifications/stats");
          dispatch({ type: "FETCH_NOTIFICATIONS_SUCCESS", payload: notifData });
        } catch (notifError) {
          console.error("Failed to fetch notification stats:", notifError);
        }
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: getError(error) });
      }
    };
    fetchData();
  }, []);

  const data = {
    labels: summary.salesDate.map((x) => x._id),
    datasets: [
      {
        label: "Sales",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        data: summary.salesDate.map((x) => x.totalSales),
      },
    ],
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {loading ? (
        <SkeletonStats count={4} />
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <div>
          {/* Stats Grid - Modern Cards with Gradients */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Sales Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full">
                    Revenue
                  </span>
                </div>
                <p className="text-white/90 text-sm font-medium mb-1">Total Sales</p>
                <p className="text-4xl font-bold text-white mb-3">
                  ${summary.ordersPrice}
                </p>
                <Link href="/admin/orders">
                  <span className="inline-flex items-center text-sm font-semibold text-white hover:text-white/80 transition-colors cursor-pointer">
                    View details
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Total Orders Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full">
                    Orders
                  </span>
                </div>
                <p className="text-white/90 text-sm font-medium mb-1">Total Orders</p>
                <p className="text-4xl font-bold text-white mb-3">
                  {summary.ordersCount}
                </p>
                <Link href="/admin/orders">
                  <span className="inline-flex items-center text-sm font-semibold text-white hover:text-white/80 transition-colors cursor-pointer">
                    View details
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Total Products Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full">
                    Inventory
                  </span>
                </div>
                <p className="text-white/90 text-sm font-medium mb-1">Total Products</p>
                <p className="text-4xl font-bold text-white mb-3">
                  {summary.productsCount}
                </p>
                <Link href="/admin/products">
                  <span className="inline-flex items-center text-sm font-semibold text-white hover:text-white/80 transition-colors cursor-pointer">
                    View details
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Total Users Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full">
                    Customers
                  </span>
                </div>
                <p className="text-white/90 text-sm font-medium mb-1">Total Users</p>
                <p className="text-4xl font-bold text-white mb-3">
                  {summary.usersCount}
                </p>
                <Link href="/admin/users">
                  <span className="inline-flex items-center text-sm font-semibold text-white hover:text-white/80 transition-colors cursor-pointer">
                    View details
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stock Notifications Card - Modern Design */}
          {notificationStats && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-8 mb-8 border border-indigo-100 dark:border-indigo-800 shadow-lg">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                      Stock Notifications
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage customer restock alerts
                    </p>
                  </div>
                  <Link href="/admin/stock-notifications">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                      View All
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pending Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      {notificationStats.pending > 0 && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-bold rounded-full animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {notificationStats.pending}
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Pending Notifications
                    </p>
                  </div>

                  {/* Sent Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                      {notificationStats.sent}
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Sent Successfully
                    </p>
                  </div>

                  {/* Total Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {notificationStats.total}
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Requests
                    </p>
                  </div>
                </div>

                {/* Alert Message */}
                {notificationStats.pending > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-500 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                          Action Required
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                          <strong>{notificationStats.pending}</strong> customers are waiting for products to restock. Update inventory to automatically notify them!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sales Report Chart - Modern Card */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Sales Report
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly revenue overview
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                  This Year
                </span>
              </div>
            </div>
            <div className="relative">
              <Bar options={options} data={data} />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

Dashboard.auth = { adminOnly: true };
