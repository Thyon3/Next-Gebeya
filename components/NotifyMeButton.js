import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import NotifyMeModal from './NotifyMeModal';

export default function NotifyMeButton({ product, userEmail = null, className = '' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Check if user is already subscribed
  useEffect(() => {
    if (userEmail && product._id) {
      checkSubscriptionStatus();
    }
  }, [userEmail, product._id]);

  const checkSubscriptionStatus = async () => {
    if (!userEmail) return;

    setCheckingStatus(true);
    try {
      const { data } = await axios.get('/api/stock-notifications/check', {
        params: {
          productId: product._id,
          email: userEmail,
        },
      });
      setIsSubscribed(data.subscribed);
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!userEmail) return;

    try {
      await axios.delete('/api/stock-notifications/unsubscribe', {
        params: {
          productId: product._id,
          email: userEmail,
        },
      });
      setIsSubscribed(false);
      toast.success('Unsubscribed from notifications');
    } catch (error) {
      toast.error('Failed to unsubscribe. Please try again.');
    }
  };

  const handleSubscribed = () => {
    setIsSubscribed(true);
    if (userEmail) {
      checkSubscriptionStatus();
    }
  };

  // If product is in stock, don't show the button
  if (product.countInStock > 0) {
    return null;
  }

  // If already subscribed, show unsubscribe button
  if (isSubscribed) {
    return (
      <button
        onClick={handleUnsubscribe}
        className={`flex items-center justify-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium ${className}`}
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        You'll be notified
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={checkingStatus}
        className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <svg
          className="w-5 h-5"
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
        {checkingStatus ? 'Checking...' : 'Notify Me When Available'}
      </button>

      <NotifyMeModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubscribed={handleSubscribed}
      />
    </>
  );
}
