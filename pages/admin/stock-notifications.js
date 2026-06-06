import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import { getError } from '@/utils/error';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, stats: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'TRIGGER_REQUEST':
      return { ...state, loadingTrigger: action.payload };
    case 'TRIGGER_SUCCESS':
      return { ...state, loadingTrigger: null };
    case 'TRIGGER_FAIL':
      return { ...state, loadingTrigger: null };
    default:
      return state;
  }
}

export default function AdminStockNotifications() {
  const [{ loading, error, stats, loadingTrigger }, dispatch] = useReducer(reducer, {
    loading: true,
    stats: null,
    error: '',
    loadingTrigger: null,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await axios.get('/api/stock-notifications/stats');
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
    }
  };

  const handleManualTrigger = async (productId) => {
    if (!confirm('Are you sure you want to send notifications for this product?')) {
      return;
    }

    try {
      dispatch({ type: 'TRIGGER_REQUEST', payload: productId });
      const { data } = await axios.post('/api/admin/stock-notifications/trigger', {
        productId,
      });
      toast.success(data.message);
      dispatch({ type: 'TRIGGER_SUCCESS' });
      fetchStats(); // Refresh stats
    } catch (err) {
      dispatch({ type: 'TRIGGER_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <AdminLayout title="Stock Notifications">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Stock Notifications</h1>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="card p-5 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending Notifications</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="card p-5 bg-gradient-to-br from-green-50 to-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Sent Notifications</p>
                      <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="card p-5 bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Subscriptions</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Most Requested Products */}
              <div className="card p-5">
                <h2 className="text-lg font-bold mb-4">Most Requested Products</h2>
                
                {stats.mostRequested.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No pending notification requests
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="px-5 text-left">Product</th>
                          <th className="p-5 text-left">Stock</th>
                          <th className="p-5 text-left">Requests</th>
                          <th className="p-5 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.mostRequested.map((item) => (
                          <tr key={item.product._id} className="border-b">
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                  <Link
                                    href={`/product/${item.product.slug}`}
                                    className="text-blue-600 hover:underline font-medium"
                                  >
                                    {item.product.name}
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                              {item.product.countInStock === 0 ? (
                                <span className="text-red-600 font-semibold">Out of Stock</span>
                              ) : (
                                <span className="text-green-600 font-semibold">
                                  {item.product.countInStock} in stock
                                </span>
                              )}
                            </td>
                            <td className="p-5">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                                {item.requestCount} {item.requestCount === 1 ? 'request' : 'requests'}
                              </span>
                            </td>
                            <td className="p-5">
                              <div className="flex gap-2">
                                <Link href={`/admin/product/${item.product._id}`}>
                                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                                    Edit Product
                                  </button>
                                </Link>
                                {item.product.countInStock > 0 && (
                                  <button
                                    onClick={() => handleManualTrigger(item.product._id)}
                                    disabled={loadingTrigger === item.product._id}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                                  >
                                    {loadingTrigger === item.product._id ? 'Sending...' : 'Send Notifications'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
    </AdminLayout>
  );
}

AdminStockNotifications.auth = { adminOnly: true };
