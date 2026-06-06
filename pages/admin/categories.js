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

  const [loadingUpload, setLoadingUpload] = useState(false);

  const uploadHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      toast.error('Cloudinary is not configured.');
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    console.log('Uploading to Cloudinary:', url);

    try {
      setLoadingUpload(true);
      const { data: signData } = await axios.get('/api/admin/cloudinary-sign');
      const { signature, timestamp } = signData;

      const formData = new FormData();
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      formData.append('file', file);

      const { data } = await axios.post(url, formData);

      setFormData(prev => ({ ...prev, image: data.secure_url }));
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setLoadingUpload(false);
    }
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
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.gradient || 'from-blue-500 to-cyan-500'} flex items-center justify-center text-2xl shadow-sm overflow-hidden`}>
                        {category.image ? (
                          <img src={category.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          category.icon || '📦'
                        )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Customize: {editingCategory?.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Category Icon</label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-xl"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon} {icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Display Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Gradient Style</label>
                  <select
                    name="gradient"
                    value={formData.gradient}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-xl"
                  >
                    {gradientOptions.map(gradient => (
                      <option key={gradient} value={gradient}>{gradient}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Background Theme</label>
                  <select
                    name="bgColor"
                    value={formData.bgColor}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-xl"
                  >
                    {bgColorOptions.map(bgColor => (
                      <option key={bgColor} value={bgColor}>{bgColor}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold">Category Image</label>
                    {loadingUpload && <div className="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full"></div>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="Image URL"
                        className="w-full p-2 border rounded-xl text-sm mb-3"
                      />
                      <input
                        type="file"
                        onChange={uploadHandler}
                        className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="w-20 h-20 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
                      {formData.image ? <img src={formData.image} alt="" className="w-full h-full object-cover" /> : <div className="text-gray-300">No Image</div>}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-xl"
                    rows="2"
                    placeholder="Brief description for this category"
                  />
                </div>

                {/* Real-time Preview */}
                <div className="md:col-span-2 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-900 rounded-2xl">
                  <h3 className="text-xs font-black uppercase text-blue-600 mb-4 tracking-widest">Live Menu Preview</h3>
                  <div className={`${formData.bgColor} rounded-2xl p-6 inline-block min-w-[200px] shadow-lg`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${formData.gradient} flex items-center justify-center text-4xl shadow-xl mb-4 border-4 border-white dark:border-gray-800 overflow-hidden`}>
                        {formData.image ? <img src={formData.image} alt="" className="w-full h-full object-cover" /> : formData.icon}
                      </div>
                      <h3 className="font-black text-xl text-gray-900 dark:text-white">{formData.name}</h3>
                      {formData.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-[180px]">{formData.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t font-bold">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-95 transition-all"
                >
                  Save Styling
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
