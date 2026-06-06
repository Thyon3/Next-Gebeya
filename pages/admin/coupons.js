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
      return { ...state, loading: false, coupons: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function AdminCoupons() {
  const [{ loading, error, coupons }, dispatch] = useReducer(reducer, {
    loading: true,
    coupons: [],
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/admin/coupons');
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const getStatusBadge = (coupon) => {
    if (coupon.isUsed) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
          Used
        </span>
      );
    }
    if (isExpired(coupon.expiryDate)) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          Expired
        </span>
      );
    }
    if (coupon.isActive) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          Active
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        Inactive
      </span>
    );
  };

  const getCouponTypeIcon = (type) => {
    if (type === 'welcome') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-5 text-blue-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      );
    }
    return null;
  };

  // Calculate statistics
  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => !c.isUsed && !isExpired(c.expiryDate) && c.isActive).length,
    used: coupons.filter((c) => c.isUsed).length,
    expired: coupons.filter((c) => isExpired(c.expiryDate) && !c.isUsed).length,
  };

  return (
    <AdminLayout title="Coupons Management">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Coupons Management</h1>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 bg-blue-50">
              <div className="text-sm text-gray-600 mb-1">Total Coupons</div>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            </div>
            <div className="card p-4 bg-green-50">
              <div className="text-sm text-gray-600 mb-1">Active</div>
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            </div>
            <div className="card p-4 bg-gray-50">
              <div className="text-sm text-gray-600 mb-1">Used</div>
              <div className="text-3xl font-bold text-gray-600">{stats.used}</div>
            </div>
            <div className="card p-4 bg-red-50">
              <div className="text-sm text-gray-600 mb-1">Expired</div>
              <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-xl">Loading...</div>
            </div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Type
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Code
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      User
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Discount
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Created
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Expires
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Used At
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="border-b hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {getCouponTypeIcon(coupon.couponType)}
                          <span className="text-sm capitalize">{coupon.couponType}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono font-semibold text-blue-600">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <div className="font-medium text-sm">
                            {coupon.userId?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {coupon.userId?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-green-600">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : `$${coupon.discountValue}`}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(coupon.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span
                          className={
                            isExpired(coupon.expiryDate)
                              ? 'text-red-600 font-semibold'
                              : 'text-gray-600'
                          }
                        >
                          {formatDate(coupon.expiryDate)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {coupon.usedAt ? formatDate(coupon.usedAt) : '-'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {getStatusBadge(coupon)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {coupons.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No coupons found
                </div>
              )}
            </div>
          )}
    </AdminLayout>
  );
}

AdminCoupons.auth = { adminOnly: true };
