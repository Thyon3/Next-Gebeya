import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import Link from 'next/link';

export default function UnsubscribePage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      handleUnsubscribe();
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    try {
      const { data } = await axios.delete(
        `/api/stock-notifications/unsubscribe?token=${token}`
      );
      setStatus('success');
      setMessage(data.message);
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 'Failed to unsubscribe. Please try again.'
      );
    }
  };

  return (
    <Layout title="Unsubscribe from Notifications">
      <div className="flex items-center justify-center min-h-screen py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Processing...
              </h2>
              <p className="text-gray-600">
                Please wait while we unsubscribe you from notifications.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Successfully Unsubscribed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link href="/">
                <button className="primary-button">
                  Return to Homepage
                </button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Unsubscribe Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link href="/">
                <button className="primary-button">
                  Return to Homepage
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
