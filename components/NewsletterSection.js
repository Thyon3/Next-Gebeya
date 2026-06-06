import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [fetchingSettings, setFetchingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        const data = await response.json();
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error fetching newsletter settings:', error);
      } finally {
        setFetchingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.alreadySubscribed) {
          toast.info('You are already subscribed to our newsletter!');
        } else {
          toast.error(data.message || 'Failed to subscribe');
        }
        setLoading(false);
        return;
      }

      const discount = data.discountPercentage || settings?.newsletterDiscountPercentage || 10;
      
      // Show success with discount code
      toast.success(
        <div>
          <div className="font-bold mb-1">🎉 Successfully Subscribed!</div>
          <div className="text-sm">Your discount code: <span className="font-mono font-bold">{data.discountCode}</span></div>
          <div className="text-xs mt-1 opacity-80">
            {data.emailSent ? 'Check your email for details!' : 'Save this code for checkout!'}
          </div>
        </div>,
        {
          autoClose: 10000,
        }
      );
      
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if disabled or still loading
  if (fetchingSettings) {
    return null;
  }

  if (!settings || !settings.newsletterEnabled) {
    return null;
  }

  const heading = settings.newsletterHeading || 'Get 10% Off Your First Order!';
  const description = settings.newsletterDescription || 'Subscribe to our newsletter and receive exclusive deals, new arrivals, and special offers directly to your inbox.';
  const buttonText = settings.newsletterButtonText || 'Subscribe Now';

  return (
    <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-16 mb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {heading}
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            {description}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-5 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subscribing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {buttonText}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Trust Message */}
          <p className="text-sm text-primary-200 mt-4 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            We respect your privacy. Unsubscribe anytime.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex items-center justify-center gap-2 text-white">
              <svg className="w-5 h-5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Exclusive Deals</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white">
              <svg className="w-5 h-5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">New Arrivals</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white">
              <svg className="w-5 h-5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Special Offers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
