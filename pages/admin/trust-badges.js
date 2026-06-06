import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '@/components/AdminLayout';
import { getError } from '@/utils/error';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, badges: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
}

export default function AdminTrustBadgesScreen() {
  const router = useRouter();
  const [{ loading, error, badges, successDelete, loadingDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    badges: [],
    error: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'shipping',
    color: 'primary',
    isActive: true,
    order: 0,
  });

  const iconOptions = [
    { value: 'shipping', label: 'Shipping', icon: '📦' },
    { value: 'security', label: 'Security', icon: '🔒' },
    { value: 'returns', label: 'Returns', icon: '↩️' },
    { value: 'support', label: 'Support', icon: '💬' },
    { value: 'quality', label: 'Quality', icon: '⭐' },
    { value: 'warranty', label: 'Warranty', icon: '🛡️' },
  ];

  const colorOptions = [
    { value: 'primary', label: 'Primary (Blue)' },
    { value: 'success', label: 'Success (Green)' },
    { value: 'info', label: 'Info (Cyan)' },
    { value: 'secondary', label: 'Secondary (Purple)' },
    { value: 'warning', label: 'Warning (Yellow)' },
    { value: 'danger', label: 'Danger (Red)' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/trust-badges`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [successDelete]);

  const deleteHandler = async (badgeId) => {
    if (!window.confirm('Are you sure you want to delete this badge?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/trust-badges/${badgeId}`);
      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('Badge deleted successfully');
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error(getError(err));
    }
  };

  const openModal = (badge = null) => {
    if (badge) {
      setEditingBadge(badge);
      setFormData({
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        isActive: badge.isActive,
        order: badge.order,
      });
    } else {
      setEditingBadge(null);
      setFormData({
        title: '',
        description: '',
        icon: 'shipping',
        color: 'primary',
        isActive: true,
        order: 0,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBadge) {
        await axios.put(`/api/admin/trust-badges/${editingBadge._id}`, formData);
        toast.success('Badge updated successfully');
      } else {
        await axios.post('/api/admin/trust-badges', formData);
        toast.success('Badge created successfully');
      }
      setShowModal(false);
      dispatch({ type: 'DELETE_RESET' });
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getIconSvg = (iconType) => {
    const icons = {
      shipping: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      ),
      security: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      ),
      returns: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      ),
      support: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      ),
      quality: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      ),
      warranty: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      ),
    };
    return icons[iconType] || icons.shipping;
  };

  return (
    <AdminLayout title="Trust Badges">
      <div className="md:col-span-3">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Trust Badges</h1>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Badge
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="alert-error">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-5 text-left">Order</th>
                  <th className="px-5 text-left">Icon</th>
                  <th className="px-5 text-left">Title</th>
                  <th className="px-5 text-left">Description</th>
                  <th className="px-5 text-left">Color</th>
                  <th className="px-5 text-left">Status</th>
                  <th className="px-5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {badges.map((badge) => (
                  <tr key={badge._id} className="border-b">
                    <td className="p-5">{badge.order}</td>
                    <td className="p-5">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {getIconSvg(badge.icon)}
                      </svg>
                    </td>
                    <td className="p-5 font-medium">{badge.title}</td>
                    <td className="p-5">{badge.description}</td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded text-sm bg-${badge.color}-100 text-${badge.color}-800`}>
                        {badge.color}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded text-sm ${badge.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {badge.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-5">
                      <button
                        onClick={() => openModal(badge)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteHandler(badge._id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={loadingDelete}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingBadge ? 'Edit Badge' : 'Create Badge'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Icon</label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Color</label>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {colorOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingBadge ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

AdminTrustBadgesScreen.auth = { adminOnly: true };
