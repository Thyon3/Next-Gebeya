import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '@/components/AdminLayout';
import { getError } from '@/utils/error';

export default function AdminSiteSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [settings, setSettings] = useState({
    // Newsletter
    newsletterHeading: '',
    newsletterDescription: '',
    newsletterDiscountPercentage: 10,
    newsletterButtonText: '',
    newsletterEnabled: true,
    // Hero Carousel
    heroShopNowText: '',
    heroAddToCartText: '',
    heroLearnMoreText: '',
    // Latest Products
    latestProductsHeading: '',
    latestProductsCount: 8,
    latestProductsEnabled: true,
    // Category Products
    categoryProductsViewAllText: '',
    categoryProductsCount: 4,
    categoryProductsEnabled: true,
    // Brand Showcase
    brandShowcaseHeading: '',
    brandShowcaseDescription: '',
    brandShowcaseViewAllText: '',
    brandShowcaseBadge1: '',
    brandShowcaseBadge2: '',
    brandShowcaseBadge3: '',
    brandShowcasePerPage: 6,
    brandShowcaseEnabled: true,
    // Testimonials
    testimonialsHeading: '',
    testimonialsDescription: '',
    testimonialsEnabled: true,
    // Recently Viewed
    recentlyViewedLimit: 8,
    recentlyViewedEnabled: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/site-settings');
      setSettings(data);
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await axios.put('/api/admin/site-settings', settings);
      // Update local state with saved data instead of fetching again
      setSettings(data);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This will delete all your custom settings.')) {
      return;
    }
    
    try {
      setSaving(true);
      await axios.post('/api/admin/site-settings/reset');
      toast.success('Settings reset to defaults successfully');
      fetchSettings(); // Refresh to get new defaults
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  if (loading) {
    return (
      <AdminLayout title="Site Settings">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: 'hero', label: 'Hero Carousel', icon: '🎠' },
    { id: 'products', label: 'Product Sections', icon: '📦' },
    { id: 'brands', label: 'Brand Showcase', icon: '🏷️' },
    { id: 'testimonials', label: 'Testimonials', icon: '💬' },
    { id: 'newsletter', label: 'Newsletter', icon: '📧' },
  ];

  return (
    <AdminLayout title="Site Settings">
      <div className="max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Homepage Settings</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Hero Carousel Tab */}
          {activeTab === 'hero' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Hero Carousel Settings</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Customize button text for featured product carousel
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Button Text</label>
                  <input
                    type="text"
                    name="heroShopNowText"
                    value={settings.heroShopNowText}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="Shop Now"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Add to Cart Button</label>
                  <input
                    type="text"
                    name="heroAddToCartText"
                    value={settings.heroAddToCartText}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="Add to Cart"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Learn More Button</label>
                  <input
                    type="text"
                    name="heroLearnMoreText"
                    value={settings.heroLearnMoreText}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="Learn More"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold text-sm" disabled>
                    {settings.heroShopNowText || 'Shop Now'}
                  </button>
                  <button type="button" className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold text-sm" disabled>
                    {settings.heroAddToCartText || 'Add to Cart'}
                  </button>
                  <button type="button" className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-sm" disabled>
                    {settings.heroLearnMoreText || 'Learn More'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">Preview</p>
              </div>
            </div>
          )}

          {/* Product Sections Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Latest Products */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Latest Products Section</h2>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="latestProductsEnabled"
                      checked={settings.latestProductsEnabled}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium">{settings.latestProductsEnabled ? 'Enabled' : 'Disabled'}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Section Heading</label>
                    <input
                      type="text"
                      name="latestProductsHeading"
                      value={settings.latestProductsHeading}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="Latest Products"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Products to Display</label>
                    <input
                      type="number"
                      name="latestProductsCount"
                      value={settings.latestProductsCount}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Category Products */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Products by Category Section</h2>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="categoryProductsEnabled"
                      checked={settings.categoryProductsEnabled}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium">{settings.categoryProductsEnabled ? 'Enabled' : 'Disabled'}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">"View All" Button Text</label>
                    <input
                      type="text"
                      name="categoryProductsViewAllText"
                      value={settings.categoryProductsViewAllText}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="View All"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Products per Category</label>
                    <input
                      type="number"
                      name="categoryProductsCount"
                      value={settings.categoryProductsCount}
                      onChange={handleInputChange}
                      min="1"
                      max="12"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Recently Viewed */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recently Viewed Products</h2>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="recentlyViewedEnabled"
                      checked={settings.recentlyViewedEnabled}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium">{settings.recentlyViewedEnabled ? 'Enabled' : 'Disabled'}</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Maximum Products to Show</label>
                  <input
                    type="number"
                    name="recentlyViewedLimit"
                    value={settings.recentlyViewedLimit}
                    onChange={handleInputChange}
                    min="4"
                    max="12"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Brand Showcase Tab */}
          {activeTab === 'brands' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Brand Showcase Settings</h2>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="brandShowcaseEnabled"
                    checked={settings.brandShowcaseEnabled}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium">{settings.brandShowcaseEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Section Heading</label>
                    <input
                      type="text"
                      name="brandShowcaseHeading"
                      value={settings.brandShowcaseHeading}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="Shop by Brand"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">"View All" Button Text</label>
                    <input
                      type="text"
                      name="brandShowcaseViewAllText"
                      value={settings.brandShowcaseViewAllText}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="View All Brands"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    name="brandShowcaseDescription"
                    value={settings.brandShowcaseDescription}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="Discover products from your favorite brands"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Brands per Page</label>
                  <input
                    type="number"
                    name="brandShowcasePerPage"
                    value={settings.brandShowcasePerPage}
                    onChange={handleInputChange}
                    min="3"
                    max="12"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    required
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-3">Trust Badges</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Badge 1</label>
                      <input
                        type="text"
                        name="brandShowcaseBadge1"
                        value={settings.brandShowcaseBadge1}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        placeholder="Trusted Brands"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Badge 2</label>
                      <input
                        type="text"
                        name="brandShowcaseBadge2"
                        value={settings.brandShowcaseBadge2}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        placeholder="Authentic Products"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Badge 3</label>
                      <input
                        type="text"
                        name="brandShowcaseBadge3"
                        value={settings.brandShowcaseBadge3}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        placeholder="Official Partners"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === 'testimonials' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Testimonials Section</h2>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="testimonialsEnabled"
                    checked={settings.testimonialsEnabled}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium">{settings.testimonialsEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Section Heading</label>
                  <input
                    type="text"
                    name="testimonialsHeading"
                    value={settings.testimonialsHeading}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="What Our Customers Say"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="testimonialsDescription"
                    value={settings.testimonialsDescription}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="Join thousands of satisfied customers..."
                    required
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-lg">
                <h3 className="text-2xl font-bold text-center mb-2">{settings.testimonialsHeading || 'What Our Customers Say'}</h3>
                <p className="text-center text-gray-600 dark:text-gray-300">{settings.testimonialsDescription || 'Join thousands of satisfied customers...'}</p>
                <p className="text-xs text-gray-500 text-center mt-3">Preview</p>
              </div>
            </div>
          )}

          {/* Newsletter Tab */}
          {activeTab === 'newsletter' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Newsletter Settings</h2>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="newsletterEnabled"
                    checked={settings.newsletterEnabled}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium">{settings.newsletterEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Heading</label>
                  <input
                    type="text"
                    name="newsletterHeading"
                    value={settings.newsletterHeading}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="Get 10% Off Your First Order!"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="newsletterDescription"
                    value={settings.newsletterDescription}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="Subscribe to our newsletter..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Discount Percentage</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="newsletterDiscountPercentage"
                        value={settings.newsletterDiscountPercentage}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        required
                      />
                      <span className="absolute right-3 top-3 text-gray-500">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Button Text</label>
                    <input
                      type="text"
                      name="newsletterButtonText"
                      value={settings.newsletterButtonText}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="Subscribe Now"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {settings.newsletterHeading.replace(/\d+%/, `${settings.newsletterDiscountPercentage}%`)}
                  </h3>
                  <p className="text-sm text-primary-100 mb-3">{settings.newsletterDescription}</p>
                  <button type="button" className="px-6 py-2 bg-secondary-500 text-white rounded-lg text-sm font-semibold" disabled>
                    {settings.newsletterButtonText}
                  </button>
                  <p className="text-xs text-primary-200 mt-2">Preview</p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-between items-center gap-3 pt-6">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              Reset to Defaults
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={fetchSettings}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={saving}
              >
                Reload
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

AdminSiteSettingsScreen.auth = { adminOnly: true };
