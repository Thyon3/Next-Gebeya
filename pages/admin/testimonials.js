import AdminLayout from '@/components/AdminLayout';
import { getError } from '@/utils/error';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, testimonials: action.payload, error: '' };
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

export default function AdminTestimonials() {
  const [{ loading, error, testimonials, successDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    testimonials: [],
    error: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Verified Buyer',
    image: '',
    rating: 5,
    text: '',
    product: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchData();
  }, [successDelete]);

  const fetchData = async () => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await axios.get('/api/admin/testimonials');
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
    }
  };

  const deleteHandler = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/testimonials/${id}`);
      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('Testimonial deleted successfully');
    } catch (error) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error(getError(error));
    }
  };

  const openCreateModal = () => {
    setEditingTestimonial(null);
    setFormData({
      name: '',
      role: 'Verified Buyer',
      image: '',
      rating: 5,
      text: '',
      product: '',
      isActive: true,
      order: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      image: testimonial.image,
      rating: testimonial.rating,
      text: testimonial.text,
      product: testimonial.product,
      isActive: testimonial.isActive,
      order: testimonial.order,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await axios.put(`/api/admin/testimonials/${editingTestimonial._id}`, formData);
        toast.success('Testimonial updated successfully');
      } else {
        await axios.post('/api/admin/testimonials', formData);
        toast.success('Testimonial created successfully');
      }
      setShowModal(false);
      dispatch({ type: 'DELETE_RESET' });
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const generateAvatarUrl = (name) => {
    const colors = ['4F46E5', '10B981', 'F59E0B', 'EF4444', '8B5CF6', '06B6D4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff&size=128`;
  };

  return (
    <AdminLayout title="Testimonials Management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Testimonials Management
        </h1>
        <button onClick={openCreateModal} className="primary-button">
          Add New Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Order
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Customer
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Rating
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Testimonial
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Product
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((testimonial) => (
                <tr key={testimonial._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-5">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.order}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full border-2 border-blue-100"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-sm text-gray-700 dark:text-gray-300 max-w-md truncate">
                      {testimonial.text}
                    </p>
                  </td>
                  <td className="p-5">
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {testimonial.product}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        testimonial.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {testimonial.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(testimonial)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteHandler(testimonial._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {testimonials.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No testimonials found. Click "Add New Testimonial" to create one.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/avatar.jpg"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: generateAvatarUrl(formData.name) })}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  Generate Avatar from Name
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Rating *
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Product Purchased *
                </label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Wireless Headphones"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Testimonial Text *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:text-white"
                  placeholder="Enter the customer's testimonial..."
                  required
                />
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

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
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

AdminTestimonials.auth = { adminOnly: true };
