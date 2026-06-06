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
import { currencyMetadata, setDefaultCurrency, fetchExchangeRates } from "@/utils/currency";

function Layout({ title, children, breadcrumbProps }) {
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
          <div className="max-w-[1600px] mx-auto xl:px-4 md:px-2 px-2 h-20 flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">eShop</span>
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
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-bold text-gray-400">Download the</span>
                  <span className="text-[11px] font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">eShop app</span>
                </div>
              </div>

              {/* Currency / Language Selector */}
              <div className="hidden md:block">
                <Menu as="div" className="relative inline-block z-50">
                  <Menu.Button className="flex items-center gap-2 hover:text-blue-600 transition-colors group">
                    <div className="w-6 h-4 bg-gray-200 rounded-sm overflow-hidden flex items-center justify-center text-[10px] font-bold text-gray-400">EN</div>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[11px] font-bold text-gray-900 dark:text-gray-100">EN/</span>
                      <span className="text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase">{hasMounted ? currency : '...'}</span>
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
                    <Menu.Button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors group">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                        {session.user.profileImage ? (
                          <img src={session.user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                        )}
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[10px] font-bold text-gray-500">Welcome</span>
                        <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100 truncate max-w-[80px]">{session.user.name.split(' ')[0]}</span>
                      </div>
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 w-64 origin-top-right p-2.5 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 mt-4 z-50 overflow-hidden">
                      {/* ... existing menu items ... */}
                      <div className="px-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl mb-2">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Welcome back,</p>
                        <p className="text-sm font-black text-gray-900 dark:text-gray-100 truncate leading-tight">{session.user.name}</p>
                      </div>
                      <div className="space-y-0.5">
                        <Menu.Item><DropdownLink href="/profile">My Profile</DropdownLink></Menu.Item>
                        <Menu.Item><DropdownLink href="/order-history">My Orders</DropdownLink></Menu.Item>
                        <Menu.Item><DropdownLink href="/wishlist">Wishlist ({wishlistItemsCount})</DropdownLink></Menu.Item>
                        <Menu.Item><DropdownLink href="/compare">Compare ({compareItemsCount})</DropdownLink></Menu.Item>
                      </div>
                      <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
                      <button onClick={toggleDarkMode} className="w-full text-left px-4 py-3 text-[13px] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl flex justify-between items-center transition-all">
                        {darkMode ? "Light Mode" : "Dark Mode"}
                        <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${darkMode ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </button>
                      <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
                      <Menu.Item>
                        <button onClick={logoutClickHandler} className="w-full text-left px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">Logout</button>
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                ) : (
                  <Link href="/login" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors group">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[10px] font-bold text-gray-500">Welcome</span>
                      <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100">Sign In / Register</span>
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
                <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100 transition-colors">Cart</span>
              </Link>
            </div>
          </div>

          {/* Bottom Nav Row */}
          <div className="hidden md:flex h-14 items-center">
            <div className="max-w-[1600px] mx-auto xl:px-4 md:px-2 px-2 flex items-center gap-6">
              <div className="flex items-center -ml-4">
                <MegaMenu customTrigger={true} />
              </div>

              <nav className="flex items-center gap-8 text-sm font-bold text-gray-800 dark:text-gray-200">
                <Link href="/choice" className="text-red-500 hover:opacity-80 transition-opacity">Choice</Link>
                <Link href="/search?sortBy=popular" className="hover:text-blue-600 transition-colors">SuperDeals</Link>
                <Link href="/search?category=Business" className="hover:text-blue-600 transition-colors whitespace-nowrap">eShop Business</Link>
                <Link href="/search?category=Automotive" className="hover:text-blue-600 transition-colors">Automotive</Link>
                <Link href="/search?category=Appliances" className="hover:text-blue-600 transition-colors">Appliances</Link>
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

        {/* Full Width Banner */}
        <div className="w-full relative h-[180px] md:h-[240px] lg:h-[280px] bg-blue-600 overflow-hidden">
          <img
            src="/bannerimage/image.png"
            alt="Promotion Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-transparent"></div>
        </div>

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
