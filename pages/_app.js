import "@/styles/globals.css";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { StoreProvider, Store } from "@/utils/Store";
import { SocketProvider } from "@/utils/SocketContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useContext, useEffect, useState } from "react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <StoreProvider>
        <DarkModeHandler />
        <RouteLoadingIndicator />
        <SocketProvider>
          <PayPalScriptProvider deferLoading={true}>
            <ToastContainer position="top-right" limit={1} />
            {Component.auth ? (
              <Auth adminOnly={Component.auth.adminOnly}>
                <Component {...pageProps} />
              </Auth>
            ) : (
              <Component {...pageProps} />
            )}
          </PayPalScriptProvider>
        </SocketProvider>
      </StoreProvider>
    </SessionProvider>
  );
}

function RouteLoadingIndicator() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url) => {
      // Only show loading for different routes
      if (url !== router.asPath) {
        setLoading(true);
      }
    };
    
    const handleComplete = () => {
      setLoading(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="relative">
        {/* Animated Shopping Bag Icon */}
        <div className="relative w-24 h-24">
          {/* Pulsing Circle Background */}
          <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-full animate-pulse"></div>
          
          {/* Shopping Bag Icon with Bounce */}
          <div className="absolute inset-0 flex items-center justify-center animate-bounce-slow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse-slow"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>

          {/* Rotating Ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin-slow"></div>
          
          {/* Counter-rotating Ring */}
          <div className="absolute inset-2 border-4 border-transparent border-b-purple-600 dark:border-b-purple-400 rounded-full animate-spin-reverse"></div>
        </div>
      </div>
    </div>
  );
}

function DarkModeHandler() {
  const { state } = useContext(Store);
  const { darkMode, fontSize } = state;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Remove all font size classes
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    
    // Add the appropriate font size class
    if (fontSize === 'small') {
      document.documentElement.classList.add('text-sm');
    } else if (fontSize === 'large') {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.add('text-base');
    }
  }, [fontSize]);

  return null;
}

function Auth({ children, adminOnly }) {
  const router = useRouter();
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/unauthorized?message=Login required");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (adminOnly && !session.user.isAdmin) {
    router.push("/unauthorized?message=Admin access required");
  }

  return children;
}
