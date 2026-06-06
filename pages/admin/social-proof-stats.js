import AdminLayout from '@/components/AdminLayout';
import { getError } from '@/utils/error';
import axios from 'axios';
import React, { useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, stats: action.payload, error: '' };
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

const iconOptions = [
  { value: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { value: 'star', label: 'Star', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { value: 'heart', label: 'Heart', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { value: 'support', label: 'Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
  { value: 'trophy', label: 'Trophy', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { value: 'chart', label: 'Chart', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { value: 'shield', label: 'Shield', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { value: 'clock', label: 'Clock', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const colorOptions = [
  { value: 'primary', label: 'Blue', class: 'text-primary-600' },
  { value: 'success', label: 'Green', class: 'text-success-600' },
  { value: 'secondary', label: 'Yellow', class: 'text-secondary-600' },
  { value: 'info', label: 'Cyan', class: 'text-info-600' },
  { value: 'warning', label: 'Orange', class: 'text-warning-600' },
  { value: 'danger', label: 'Red', class: 'text-danger-600' },
];

export default function AdminSocialProofStats() {
  const [{ loading, error, stats, successDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    stats: [],
    error: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    icon: 'users',
    color: 'primary',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchData();
  }, [successDelete]);

  const fetchData = async () => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await axios.get('/api/admin/social-proof-stats');
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
    }
  };

  const deleteHandler = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stat?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/social-proof-stats/${id}`);
      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('Stat deleted successfully');
    } catch (error) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error(getError(error));
    }
  };

  const openCreateModal = () => {
    setEditingStat(null);
    setFormData({
      label: '',
      value: '',
      icon: 'users',
      color: 'primary',
      isActive: true,
      order: stats.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (stat) => {
    setEditingStat(stat);
    setFormData({
      label: stat.label,
      value: stat.value,
      icon: stat.icon,
      color: stat.color,
      isActive: stat.isActive,
      order: stat.order,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStat) {
        await axios.put(`/api/admin/social-proof-stats/${editingStat._id}`, formData);
        toast.success('Stat updated successfully');
      } else {
        await axios.post('/api/admin/social-proof-stats', formData);
        toast.success('Stat created successfully');
      }
      setShowModal(false);
      dispatch({ type: 'DELETE_RESET' });
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const getColorClass = (color) => {
    const colorMap = {
      primary: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400',
      secondary: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-cyan-600 dark:text-cyan-400',
      warning: 'text-orange-600 dark:text-orange-400',
      danger: 'text-red-600 dark:text-red-400',
    };
    return colorMap[color] || colorMap.primary;
  };

  const renderIcon = (iconName) => {
    const icon = iconOptions.find(i => i.value === iconName);
    if (!icon) return null;
    return (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d={icon.icon} clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <AdminLayout title="Social Proof Stats Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Social Proof Stats
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage the stats displayed below testimonials on the homepage
          </p>
        </div>
        <button onClick={openCreateModal} className="primary-button">
          Add New Stat
        </button>
      </div>

      {/* Preview Section */}
      {stats.filter(s => s.isActive).length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Live Preview (as shown on homepage)
          </h2>
          <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.filter(s => s.isActive).length, 4)} gap-6`}>
            {stats.filter(s => s.isActive).map((stat) => (
              <div key={stat._id} className="text-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className={`text-3xl md:text-4xl font-bold mb-1 ${getColorClass(stat.color)}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <>
          {stats.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No stats found. Click "Add New Stat" to create one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={getColorClass(stat.color)}>
                      {renderIcon(stat.icon)}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        stat.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {stat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className={`text-3xl font-bold mb-2 ${getColorClass(stat.color)}`}>
                    {stat.value}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {stat.label}
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    Order: {stat.order}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(stat)}
                      className="flex-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm py-2 px-3 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteHandler(stat._id)}
                      className="flex-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm py-2 px-3 border border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingStat ? 'Edit Stat' : 'Add New Stat'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Value (e.g., 10K+, 98%, 24/7) *
                  </label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="10K+"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Happy Customers"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Color
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {colorOptions.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lower numbers appear first (0, 1, 2, 3...)
                </p>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Active (Display on website)
                  </span>
                </label>
              </div>

              {/* Preview */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Preview:</p>
                <div className="text-center bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <div className={`text-3xl md:text-4xl font-bold mb-1 ${getColorClass(formData.color)}`}>
                    {formData.value || '10K+'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.label || 'Happy Customers'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {editingStat ? 'Update Stat' : 'Create Stat'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

AdminSocialProofStats.auth = { adminOnly: true };
