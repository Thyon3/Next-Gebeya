import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function WelcomeBanner() {
  const { data: session } = useSession();
  const [coupon, setCoupon] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Loading...');

  useEffect(() => {
    if (session?.user) {
      fetchUserCoupon();
    } else {
      setDebugInfo('Not logged in');
    }
  }, [session]);

  const fetchUserCoupon = async () => {
    try {
      setDebugInfo('Fetching coupon...');
      const { data } = await axios.get('/api/coupons/user-coupon');
      if (data.hasCoupon) {
        setCoupon(data.coupon);
        setShowBanner(true);
        setDebugInfo('Coupon found!');
      } else {
        setDebugInfo('No coupon available');
      }
    } catch (error) {
      console.error('Error fetching coupon:', error);
      setDebugInfo(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success('Coupon code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  if (!showBanner || !coupon) {
    return null;
  }

  // Calculate days remaining
  const expiryDate = new Date(coupon.expiryDate);
  const now = new Date();
  const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 md:px-8 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Welcome Message */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Welcome Gift! 🎉</h3>
            <p className="text-sm text-white/90">
              Get {coupon.discountValue}% off on your first product
            </p>
          </div>
        </div>

        {/* Coupon Code */}
        <div className="flex items-center gap-3">
          <div className="bg-white text-gray-900 px-4 py-2 rounded-lg font-mono font-bold text-lg tracking-wider">
            {coupon.code}
          </div>
          <button
            onClick={copyToClipboard}
            className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Expiry Info */}
        <div className="text-center md:text-right">
          <p className="text-sm font-semibold">
            {daysRemaining > 0 ? (
              <>Expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</>
            ) : (
              <>Expires today!</>
            )}
          </p>
          <p className="text-xs text-white/80">Use it before it's gone!</p>
        </div>

        {/* Close Button */}
        <button
          onClick={closeBanner}
          className="absolute top-2 right-2 md:relative md:top-0 md:right-0 text-white/80 hover:text-white transition-colors"
          aria-label="Close banner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
