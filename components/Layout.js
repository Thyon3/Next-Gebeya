import { Store } from "@/utils/Store";
import { Menu } from "@headlessui/react";
import Cookies from "js-cookie";
import { signOut, useSession } from "next-auth/react";
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
import { currencyMetadata, setDefaultCurrency, fetchExchangeRates } from "@/utils/currency";

function Layout({ title, children, breadcrumbProps }) {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { state, dispatch } = useContext(Store);
  const { cart, currency, wishlist, compare, darkMode, fontSize } = state;

  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState(0);
  const [compareItemsCount, setCompareItemsCount] = useState(0);
  const [toggle, setToggle] = useState(false);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

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
        
        {/* Favicon - Shopping Bag Icon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#2563eb" />
      </Head>

      <div className="flex min-h-screen flex-col justify-between">
        {/* Skip to main content link for keyboard users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Welcome Banner - Above Header */}
        <WelcomeBanner />
        
        <header 
          role="banner" 
          className={`sticky top-0 z-40 bg-white dark:bg-gray-900 transition-all duration-300 ${
            isScrolled ? 'shadow-lg' : 'shadow-md'
          }`}
        >
          <nav className="flex h-14 justify-between items-center px-16">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <Link href="/">
                <span className="text-2xl font-bold">eShop</span>
              </Link>
            </div>

            {/* Mega Menu - Desktop */}
            <div className="hidden lg:flex">
              <MegaMenu />
            </div>

            <div className="mx-auto hidden w-full max-w-md justify-center md:flex" role="search" aria-label="Product search">
              <SearchAutocomplete />
            </div>

            <div className="hidden md:flex items-center gap-4">
              {/* Font Size Controls */}
              <Menu as="div" className="relative inline-block z-10">
                <Menu.Button 
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Font size options"
                >
                  <span className="sr-only">Change font size</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                    />
                  </svg>
                </Menu.Button>
                <Menu.Items className="absolute right-0 w-40 origin-top-right p-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Font Size
                  </div>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => changeFontSize('small')}
                        className={`${
                          active ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        } ${
                          fontSize === 'small' ? "bg-blue-100 dark:bg-blue-900/30 font-semibold" : ""
                        } w-full text-left px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm`}
                      >
                        Small
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => changeFontSize('medium')}
                        className={`${
                          active ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        } ${
                          fontSize === 'medium' ? "bg-blue-100 dark:bg-blue-900/30 font-semibold" : ""
                        } w-full text-left px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-base`}
                      >
                        Medium
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => changeFontSize('large')}
                        className={`${
                          active ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        } ${
                          fontSize === 'large' ? "bg-blue-100 dark:bg-blue-900/30 font-semibold" : ""
                        } w-full text-left px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-lg`}
                      >
                        Large
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                aria-pressed={darkMode}
              >
                <span className="sr-only">{darkMode ? "Light mode" : "Dark mode"}</span>
                {darkMode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6 text-yellow-500"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-700"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                    />
                  </svg>
                )}
              </button>

              {/* Currency Selector */}
              <Menu as="div" className="relative inline-block z-10">
                <Menu.Button 
                  className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="Select currency"
                >
                  <span className="sr-only">Currency selector</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                  <span className="font-medium">{currency}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </Menu.Button>
                <Menu.Items className="absolute right-0 w-48 origin-top-right p-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-2 max-h-96 overflow-y-auto">
                  {ratesLoading && (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                      Loading rates...
                    </div>
                  )}
                  {Object.keys(currencyMetadata).map((code) => (
                    <Menu.Item key={code}>
                      {({ active }) => (
                        <button
                          onClick={() => changeCurrency(code)}
                          className={`${
                            active ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          } ${
                            currency === code ? "bg-blue-100 dark:bg-blue-900/30 font-semibold" : ""
                          } w-full text-left px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between dark:text-gray-200`}
                        >
                          <span>
                            {currencyMetadata[code].symbol} {code}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {currencyMetadata[code].name}
                          </span>
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                  {exchangeRates && !ratesLoading && (
                    <div className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 text-center border-t dark:border-gray-700 mt-2">
                      Live rates • Updated hourly
                    </div>
                  )}
                </Menu.Items>
              </Menu>

              {status === "loading" ? (
                <span className="dark:text-gray-300">Loading</span>
              ) : session?.user ? (
                <Menu as="div" className="relative inline-block z-10">
                  <Menu.Button className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    {session.user.profileImage ? (
                      <img
                        src={session.user.profileImage}
                        alt={session.user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold border-2 border-blue-500">
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="font-medium">{session.user.name}</span>
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 w-56 origin-top-right p-2 bg-white dark:bg-gray-800 shadow-lg rounded-t-lg rounded-b-lg">
                    <Menu.Item>
                      <DropdownLink href="/profile">Profile</DropdownLink>
                    </Menu.Item>

                    <Menu.Item>
                      <DropdownLink href="/wishlist">
                        Wishlist ({wishlistItemsCount})
                      </DropdownLink>
                    </Menu.Item>

                    <Menu.Item>
                      <DropdownLink href="/order-history">
                        Order History
                      </DropdownLink>
                    </Menu.Item>

                    {session.user.isAdmin && (
                      <Menu.Item>
                        <DropdownLink href="/admin/dashboard">
                          Admin Dashboard
                        </DropdownLink>
                      </Menu.Item>
                    )}

                    <Menu.Item>
                      <DropdownLink href="#" logout={logoutClickHandler}>
                        Logout
                      </DropdownLink>
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              ) : (
                <Link href="/login">
                  <span className="p-2 dark:text-gray-300">Login</span>
                </Link>
              )}

              {/* Compare */}
              <Link href="/compare">
                <div className="flex items-center gap-2 relative">
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-7 h-7 dark:text-gray-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
                    </svg>
                    <span className="absolute -top-1.5 -right-1.5 rounded-full bg-purple-600 px-1.5 py-0.5 text-[10px] font-semibold text-white min-w-[18px] h-[18px] flex items-center justify-center leading-none">
                      {compareItemsCount}
                    </span>
                  </div>
                  <span className="text-base font-medium dark:text-gray-300">Compare</span>
                </div>
              </Link>

              {/* Cart */}
              <Link href="/cart">
                <div className="flex items-center gap-2 relative">
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-7 h-7 dark:text-gray-300"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                      />
                    </svg>
                    <span className="absolute -top-1.5 -right-1.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white min-w-[18px] h-[18px] flex items-center justify-center leading-none">
                      {cartItemsCount}
                    </span>
                  </div>
                  <span className="text-base font-medium dark:text-gray-300">Cart</span>
                </div>
              </Link>
            </div>

            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="mobile-menu-button"
                onClick={() => setToggle(!toggle)}
                aria-label="Toggle mobile menu"
                aria-expanded={toggle}
                aria-controls="mobile-menu"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                  />
                </svg>
              </button>
            </div>
          </nav>

          <div
            id="mobile-menu"
            className={`${
              toggle === false ? "hidden" : ""
            } md:hidden flex flex-col my-3 mx-3 p-2 bg-gray-50 rounded-md shadow-md`}
          >
            <div className="py-4 px-4 text-sm mx-auto w-full">
              <SearchAutocomplete />
            </div>

            {/* Mobile Mega Menu */}
            <div className="px-4 py-2 border-b border-gray-200">
              <MegaMenu />
            </div>

            <div className="flex flex-col space-y-3 mx-auto">
              <div>
                <Link href="/compare">
                  <div className="flex items-center gap-2 relative">
                    <div className="relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-7 h-7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                        />
                      </svg>
                      <span className="absolute -top-1.5 -right-1.5 rounded-full bg-purple-600 px-1.5 py-0.5 text-[10px] font-semibold text-white min-w-[18px] h-[18px] flex items-center justify-center leading-none">
                        {compareItemsCount}
                      </span>
                    </div>
                    <span className="text-base font-medium">Compare</span>
                  </div>
                </Link>
              </div>
              <div>
                <Link href="/cart">
                  <div className="flex items-center gap-2 relative">
                    <div className="relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-7 h-7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                        />
                      </svg>
                      <span className="absolute -top-1.5 -right-1.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white min-w-[18px] h-[18px] flex items-center justify-center leading-none">
                        {cartItemsCount}
                      </span>
                    </div>
                    <span className="text-base font-medium">Cart</span>
                  </div>
                </Link>
              </div>
              {status === "loading" ? (
                "Loading"
              ) : session?.user ? (
                <Menu as="div" className="relative inline-block z-10">
                  <Menu.Button className="flex items-center gap-2">
                    {session.user.profileImage ? (
                      <img
                        src={session.user.profileImage}
                        alt={session.user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold border-2 border-blue-500">
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="font-medium">{session.user.name}</span>
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </Menu.Button>
                  <Menu.Items className="absolute w-40 p-2 bg-white shadow-lg rounded-t-lg rounded-b-lg">
                    <Menu.Item>
                      <DropdownLink href="/profile">Profile</DropdownLink>
                    </Menu.Item>

                    <Menu.Item>
                      <DropdownLink href="/wishlist">
                        Wishlist ({wishlistItemsCount})
                      </DropdownLink>
                    </Menu.Item>

                    <Menu.Item>
                      <DropdownLink href="/order-history">
                        Order History
                      </DropdownLink>
                    </Menu.Item>

                    {session.user.isAdmin && (
                      <Menu.Item>
                        <DropdownLink href="/admin/dashboard">
                          Admin Dashboard
                        </DropdownLink>
                      </Menu.Item>
                    )}

                    <Menu.Item>
                      <DropdownLink href="#" logout={logoutClickHandler}>
                        Logout
                      </DropdownLink>
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              ) : (
                <Link href="/login">
                  <span className="p-2">Login</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        <main id="main-content" role="main" className="container m-auto mt-4 xl:px-14 md:px-12 px-8">
          <Breadcrumb {...breadcrumbProps} />
          {children}
        </main>

        <Footer />

        {/* WebSocket Connection Status */}
        <ConnectionStatus />
      </div>
    </>
  );
}

export default Layout;
