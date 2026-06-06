import axios from 'axios';
import Link from 'next/link';
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
      return { ...state, loading: false, categories: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_SUCCESS':
      return { ...state, successUpdate: true };
    case 'UPDATE_RESET':
      return { ...state, successUpdate: false };
    default:
      return state;
  }
}

export default function AdminCategoriesScreen() {
  const router = useRouter();
  const [{ loading, error, categories, successUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    categories: [],
    error: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    image: '',
    description: '',
    order: 0,
  });

  const gradientOptions = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-blue-500',
    'from-yellow-500 to-orange-500',
    'from-teal-500 to-cyan-500',
    'from-violet-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-red-500 to-orange-500',
  ];

  const bgColorOptions = [
    'bg-blue-50 dark:bg-blue-900/20',
    'bg-purple-50 dark:bg-purple-900/20',
    'bg-green-50 dark:bg-green-900/20',
    'bg-orange-50 dark:bg-orange-900/20',
    'bg-indigo-50 dark:bg-indigo-900/20',
    'bg-yellow-50 dark:bg-yellow-900/20',
    'bg-teal-50 dark:bg-teal-900/20',
    'bg-violet-50 dark:bg-violet-900/20',
    'bg-pink-50 dark:bg-pink-900/20',
    'bg-red-50 dark:bg-red-900/20',
  ];

  const iconOptions = ['📦', '💻', '👕', '👟', '🎧', '📚', '🎮', '⚽', '🏠', '💄', '🍔', '📱', '⌚', '🎨', '🔧', '🎵'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/categories`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successUpdate) {
      dispatch({ type: 'UPDATE_RESET' });
    } else {
      fetchData();
    }
  }, [successUpdate]);

  const openModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || '📦',
      gradient: category.gradient || 'from-blue-500 to-cyan-500',
      bgColor: category.bgColor || 'bg-blue-50 dark:bg-blue-900/20',
      image: category.image || '',
      description: category.description || '',
      order: category.order || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/categories/${encodeURIComponent(editingCategory.name)}`, formData);
      toast.success('Category styling updated successfully');
      setShowModal(false);
      dispatch({ type: 'UPDATE_SUCCESS' });
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

  return (
    <AdminLayout title="Categories">
      <div className="md:col-span-3">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Manage Category Icons & Styling</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Categories are automatically discovered from your products. Customize their appearance here.
          </p>
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
                  <th className="px-5 text-left">Preview</th>
                  <th className="px-5 text-left">Category Name</th>
                  <th className="px-5 text-left">Products</th>
                  <th className="px-5 text-left">Description</th>
                  <th className="px-5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.name} className="border-b">
                    <td className="p-5">{category.order || 0}</td>
                    <td className="p-5">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.gradient || 'from-blue-500 to-cyan-500'} flex items-center justify-center text-2xl`}>
                        {category.icon || '📦'}
                      </div>
                    </td>
                    <td className="p-5 font-medium">{category.name}</td>
                    <td className="p-5">{category.productCount || 0}</td>
                    <td className="p-5 text-sm text-gray-600 dark:text-gray-400">
                      {category.description || 'No description'}
                    </td>
                    <td className="p-5">
                      <button
                        onClick={() => openModal(category)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Customize
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
            <h2 className="text-2xl font-bold mb-2">
              Customize Category: {editingCategory?.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Configure the icon, colors, and display settings for this category
            </p>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium">Category Name (from products)</label>
                  <input
                    type="text"
                    value={formData.name}
                    className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
                    disabled
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
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon} {icon}</option>
                    ))}
                  </select>
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
                <div>
                  <label className="block mb-2">Gradient</label>
                  <select
                    name="gradient"
                    value={formData.gradient}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {gradientOptions.map(gradient => (
                      <option key={gradient} value={gradient}>{gradient}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Background Color</label>
                  <select
                    name="bgColor"
                    value={formData.bgColor}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {bgColorOptions.map(bgColor => (
                      <option key={bgColor} value={bgColor}>{bgColor}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2">Image URL (optional)</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                    placeholder="Brief description for this category"
                  />
                </div>
                <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium mb-2">Preview</h3>
                  <div className={`${formData.bgColor} rounded-xl p-6 inline-block`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${formData.gradient} flex items-center justify-center text-3xl shadow-lg mb-3`}>
                        {formData.icon}
                      </div>
                      <h3 className="font-bold text-lg">{formData.name}</h3>
                      {formData.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formData.description}</p>
                      )}
                    </div>
                  </div>
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

AdminCategoriesScreen.auth = { adminOnly: true };
