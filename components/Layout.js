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
        <WelcomeBanner />

        <header className="z-40 bg-white dark:bg-gray-900 shadow-sm sticky top-0 border-b border-gray-100 dark:border-gray-800">
          {/* Top Bar */}
          <div className="hidden md:flex bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 h-10 px-16 items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Help Center
              </span>
              <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">Sell on eShop</Link>
            </div>
            <div className="flex items-center gap-6">
              <Menu as="div" className="relative inline-block z-50">
                <Menu.Button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  Ship to / {currency}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
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
          </div>

          {/* Main Row */}
          <div className="h-24 px-16 flex items-center justify-between gap-12">
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="bg-blue-600 p-2.5 rounded-2xl text-white group-hover:rotate-6 transition-transform shadow-lg shadow-blue-200 dark:shadow-none">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <span className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">eShop</span>
            </Link>

            <div className="flex-1 max-w-2xl hidden md:block">
              <SearchAutocomplete />
            </div>

            <div className="flex items-center gap-8">
              <div className="hidden lg:block">
                {status === "loading" ? (
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
                ) : session?.user ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex flex-col items-center gap-0.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors group">
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all">
                        {session.user.profileImage ? (
                          <img src={session.user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 uppercase">{session.user.name[0]}</div>
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter">Account</span>
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 w-64 origin-top-right p-2.5 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 mt-4 z-50 overflow-hidden">
                      <div className="px-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl mb-2">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Signed in as</p>
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
                      <div className="flex px-4 py-2 gap-2 items-center">
                        <span className="text-[13px] font-bold text-gray-700 dark:text-gray-200">Font</span>
                        <div className="flex gap-1 flex-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                          {['small', 'medium', 'large'].map(s => (
                            <button key={s} onClick={() => changeFontSize(s)} className={`flex-1 py-1 rounded-md text-[9px] font-black uppercase transition-all ${fontSize === s ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}>
                              {s[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
                      <Menu.Item>
                        <button onClick={logoutClickHandler} className="w-full text-left px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">Logout</button>
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                ) : (
                  <Link href="/login" className="flex flex-col items-center gap-0.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-[10px] font-bold uppercase">Login</span>
                  </Link>
                )}
              </div>

              <Link href="/cart" className="flex flex-col items-center gap-0.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors relative">
                <div className="relative">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  {cartItemsCount > 0 && <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-md">{cartItemsCount}</span>}
                </div>
                <span className="text-[10px] font-bold uppercase">Cart</span>
              </Link>
            </div>
          </div>

          {/* Bottom Nav Row */}
          <div className="hidden md:flex h-12 px-16 border-t border-gray-50 dark:border-gray-800 items-center justify-between">
            <div className="flex items-center gap-10 h-full">
              <MegaMenu />
              <div className="h-5 w-px bg-gray-200 dark:bg-gray-700"></div>
              <nav className="flex items-center gap-10 text-[13px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <Link href="/search?sortBy=newest" className="hover:text-blue-600 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></span>
                  New Arrivals
                </Link>
                <Link href="/search?sortBy=popular" className="hover:text-blue-600 transition-colors">Best Sellers</Link>
                <Link href="/order-history" className="hover:text-blue-600 transition-colors">My Orders</Link>
              </nav>
            </div>
            <div className="flex items-center text-xs font-black text-red-600 gap-1">
              Special Offer: 20% OFF Welcome Coupon!
            </div>
          </div>
        </header>

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

        <main id="main-content" role="main" className="flex-1 container mx-auto mt-8 xl:px-14 md:px-12 px-6">
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
