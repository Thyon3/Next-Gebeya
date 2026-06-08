import { Store } from "@/utils/Store";
import { Menu } from "@headlessui/react";
import Cookies from "js-cookie";
import { useAuth } from "@/utils/AuthContext";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import DropdownLink from "./DropdownLink";
import WelcomeBanner from "./WelcomeBanner";
import ConnectionStatus from "./ConnectionStatus";
import SearchAutocomplete from "./SearchAutocomplete";
import Footer from "./Footer";
import MegaMenu from "./MegaMenu";
import Breadcrumb from "./Breadcrumb";
import DynamicBanner from "./DynamicBanner";
import { currencyMetadata, setDefaultCurrency, fetchExchangeRates } from "@/utils/currency";

function Layout({ title, children, breadcrumbProps, hideBanner }) {
  const router = useRouter();
  const { user, loading: status, logout: signOut } = useAuth();
  const session = user ? { user } : null;
  const { state, dispatch } = useContext(Store);
  const { cart, currency, wishlist, compare, darkMode, fontSize } = state;

  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState(0);
  const [compareItemsCount, setCompareItemsCount] = useState(0);
  const [toggle, setToggle] = useState(false);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Detect scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCartItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);

  useEffect(() => {
    setWishlistItemsCount(wishlist.wishlistItems.length);
  }, [wishlist.wishlistItems]);

  useEffect(() => {
    setCompareItemsCount(compare.compareItems.length);
  }, [compare.compareItems]);

  // Fetch exchange rates on mount
  useEffect(() => {
    const loadRates = async () => {
      try {
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error('Failed to load exchange rates:', error);
      } finally {
        setRatesLoading(false);
      }
    };
    loadRates();
  }, []);

  const logoutClickHandler = () => {
    Cookies.remove("cart");
    dispatch({ type: "CART_RESET" });
    signOut({ callbackUrl: "/login" });
  };

  const changeCurrency = (currencyCode) => {
    setDefaultCurrency(currencyCode);
    dispatch({ type: "SET_CURRENCY", payload: currencyCode });
  };

  const toggleDarkMode = () => {
    dispatch({ type: darkMode ? "DARK_MODE_OFF" : "DARK_MODE_ON" });
  };

  const changeFontSize = (size) => {
    dispatch({ type: "SET_FONT_SIZE", payload: size });
  };

  return (
    <>
      <Head>
        <title>{title ? `${title} - eShop` : "eShop"}</title>
        <meta name="description" content="eShop - Modern E-commerce Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </Head>

      <div className="flex min-h-screen flex-col justify-between bg-white dark:bg-gray-950 transition-colors duration-300">

        <header className="z-40 bg-white dark:bg-gray-900 sticky top-0 border-b border-gray-100 dark:border-gray-800">
          {/* Main Row */}
          <div className="max-w-[1600px] mx-auto px-4 h-20 flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-1 flex-shrink-0">
              <span className="text-3xl font-black tracking-tighter text-black dark:text-white">eShop</span>
            </Link>

            <div className="flex-1 max-w-none ml-1 mr-6 hidden md:block">
              <SearchAutocomplete />
            </div>

            <div className="flex items-center gap-6">
              {/* Download App QR Section */}
              <div className="hidden xl:flex items-center gap-2 group cursor-pointer">
                <div className="p-1 border border-gray-200 dark:border-gray-700 rounded-md group-hover:border-gray-900 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm13-2h3v2h-3zm-3 0h2v2h-2zm3 3h3v2h-3zm-3 0h2v2h-2zm0 3h2v2h-2zm3 0h3v2h-3z" /></svg>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-medium text-gray-500">Download the</span>
                  <span className="text-[11px] font-bold text-black dark:text-white whitespace-nowrap">eShop app</span>
                </div>
              </div>

              {/* Currency / Language Selector */}
              <div className="hidden md:block">
                <Menu as="div" className="relative inline-block z-50">
                  <Menu.Button className="flex items-center gap-2 hover:text-blue-600 transition-colors group">
                    <div className="w-6 h-4 bg-gray-200 rounded-sm overflow-hidden flex items-center justify-center text-[10px] font-bold text-gray-400">EN</div>
                    <div className="flex flex-col items-start leading-none -space-y-0.5">
                      <span className="text-[11px] font-bold text-black dark:text-white">EN/</span>
                      <span className="text-[11px] font-bold text-black dark:text-white uppercase">{hasMounted ? currency : '...'}</span>
                    </div>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 w-48 origin-top-right p-2 bg-white dark:bg-gray-800 shadow-2xl rounded-xl mt-2 max-h-96 overflow-y-auto border border-gray-100 dark:border-gray-700">
                    {Object.keys(currencyMetadata).map((code) => (
                      <Menu.Item key={code}>
                        {({ active }) => (
                          <button onClick={() => changeCurrency(code)} className={`${active ? "bg-blue-50 dark:bg-blue-900/20" : ""} ${currency === code ? "text-blue-600" : ""} w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between text-xs`}>
                            <span>{currencyMetadata[code].symbol} {code}</span>
                            <span className="opacity-50">{currencyMetadata[code].name}</span>
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Menu>
              </div>

              {/* Account Dropdown */}
              <div className="hidden lg:block">
                {status === "loading" ? (
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
                ) : session?.user ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                        {session.user.profileImage ? (
                          <img src={session.user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {session.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Welcome,</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">{session.user.name.split(' ')[0]}</span>
                      </div>
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 w-96 origin-top-right bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 mt-3 z-50 overflow-hidden">
                      {/* User Info Header - Only show when logged in */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                            {session.user.profileImage ? (
                              <img src={session.user.profileImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                                {session.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{session.user.name}</p>
                            <p className="text-xs text-gray-500">{session.user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/order-history" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                              My Orders
                            </Link>
                          )}
                        </Menu.Item>
                        
                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/coins" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              My Coins
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/messages" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                              Message Center
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/payment" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                              Payment
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/wishlist" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                              Wish List
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/coupons" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                              My Coupons
                            </Link>
                          )}
                        </Menu.Item>
                      </div>

                      {/* Settings Section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                        <div className="px-5 py-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase">Settings</p>
                        </div>
                        
                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/profile" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              Settings
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/business" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                              eShop Business
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/ds-center" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                              DS Center
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/seller" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                              Seller Log In
                            </Link>
                          )}
                        </Menu.Item>
                      </div>

                      {/* Help Section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/help" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Help Center
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/disputes" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              Disputes & Reports
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <button onClick={logoutClickHandler} className={`flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-600 w-full ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                              Logout
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Menu>
                ) : (
                  <Link href="/login" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors group">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <div className="flex flex-col items-start leading-none -space-y-0.5">
                      <span className="text-[10px] font-medium text-gray-500">Welcome</span>
                      <span className="text-[13px] font-bold text-black dark:text-white">Sign In / Register</span>
                    </div>
                  </Link>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors relative">
                <div className="relative">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <span className="absolute -top-1 -right-2 bg-gray-900 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-950">{cartItemsCount}</span>
                </div>
                <span className="text-[14px] font-bold text-black dark:text-white transition-colors">Cart</span>
              </Link>
            </div>
          </div>

          {/* Bottom Nav Row */}
          <div className="hidden md:flex h-14 items-center">
            <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-6">
              <div className="flex items-center">
                <MegaMenu customTrigger={true} />
              </div>

              <nav className="flex items-center gap-10 text-[14px] font-bold text-black dark:text-white">
                <Link href="/choice" className="text-[#ff4e50] hover:opacity-80 transition-opacity">Choice</Link>
                <Link href="/search?sortBy=popular" className="hover:text-amber-500 transition-colors">SuperDeals</Link>
                <Link href="/search?category=Business" className="hover:text-[#ff4e50] transition-colors whitespace-nowrap">eShop Business</Link>
                <Link href="/search?category=Automotive" className="hover:text-[#ff4e50] transition-colors">Automotive</Link>
                <Link href="/search?category=Appliances" className="hover:text-[#ff4e50] transition-colors">Appliances</Link>
                <Link href="/search?category=Women's Clothing" className="hidden lg:block hover:text-blue-600 transition-colors">Women's Clothing</Link>
                <Link href="/search?category=Men's Clothing" className="hidden xl:block hover:text-blue-600 transition-colors">Men's Clothing</Link>
                <Link href="/search?category=Furniture" className="hidden 2xl:block hover:text-blue-600 transition-colors whitespace-nowrap">Furniture</Link>
                <div className="flex items-center gap-1 text-gray-400 hover:text-gray-900 cursor-pointer">
                  <span>More</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Dynamic Multi-Image Banner */}
        {router.pathname === '/' && <DynamicBanner />}

        {/* Mobile Sidebar */}
        {toggle && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm" onClick={() => setToggle(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-2xl p-8">
              <div className="flex justify-between items-center mb-10">
                <span className="text-2xl font-black text-blue-600 tracking-tighter">eShop</span>
                <button onClick={() => setToggle(false)} className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-2xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="mb-10"><SearchAutocomplete /></div>
              <div className="space-y-4 font-black">
                <Link href="/" onClick={() => setToggle(false)} className="block py-4">Home</Link>
                <Link href="/cart" onClick={() => setToggle(false)} className="block py-4 border-t">Cart ({cartItemsCount})</Link>
                <div className="pt-6 border-t"><MegaMenu /></div>
              </div>
            </div>
          </div>
        )}

        <main id="main-content" role="main" className="flex-1 max-w-[1600px] mx-auto mt-8 xl:px-4 md:px-2 px-2 w-full">
          <Breadcrumb {...breadcrumbProps} />
          {children}
        </main>

        <Footer />
        <ConnectionStatus />
      </div>
    </>
  );
}

export default Layout;
