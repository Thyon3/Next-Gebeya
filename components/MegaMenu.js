import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MegaMenu({ customTrigger = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [megaData, setMegaData] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchMegaData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories/megamenu');
        const result = await response.json();

        if (result.success && result.data) {
          setMegaData(result.data);
          if (result.data.length > 0) {
            setActiveCategory(result.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching mega menu data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMegaData();
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const categoryMouseEnter = (cat) => {
    setActiveCategory(cat);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Mega Menu Trigger */}
      <button
        onMouseEnter={handleMouseEnter}
        onClick={() => setIsOpen(!isOpen)}
        className={customTrigger
          ? "flex items-center gap-2 px-6 py-2 bg-gray-50 dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-100 transition-colors shadow-sm"
          : "flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
        }
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">All Categories</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {/* Mega Menu Content */}
      {isOpen && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute left-0 top-full mt-2 w-[1100px] bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800 z-[100] flex overflow-hidden animate-fadeIn"
        >
          {/* Left Sidebar: Category List */}
          <div className="w-[280px] bg-white dark:bg-gray-900 border-r border-gray-50 dark:border-gray-800 py-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {megaData.map((cat, index) => (
              <div
                key={index}
                onMouseEnter={() => categoryMouseEnter(cat)}
                className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-colors ${activeCategory?.name === cat.name ? 'bg-gray-50 dark:bg-gray-800 text-blue-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[13px] font-bold">{cat.name}</span>
                </div>
                <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </div>
            ))}
          </div>

          {/* Right Panel: Content */}
          <div className="flex-1 bg-white dark:bg-gray-900 p-8 min-h-[500px]">
            {activeCategory && (
              <div className="animate-slideUpFast">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50 dark:border-gray-800">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{activeCategory.name}</h2>
                  <Link href={`/search?category=${activeCategory.name}`} className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
                </div>

                {/* Featured Products Part */}
                <div className="mb-10">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Recommended for you</h3>
                  <div className="grid grid-cols-5 gap-6">
                    {activeCategory.products && activeCategory.products.map((prod, idx) => (
                      <Link href={`/product/${prod.slug}`} key={idx} className="group flex flex-col gap-3">
                        <div className="aspect-square relative bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 group-hover:shadow-lg transition-all p-2">
                          <Image src={prod.image} alt={prod.name} fill className="object-contain p-1 group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm">
                            ${prod.price}
                          </div>
                        </div>
                        <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-blue-600 transition-colors leading-relaxed h-[34px]">{prod.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Shop By Brand Section */}
                <div>
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Shop by Brand</h3>
                  <div className="flex flex-wrap gap-3">
                    {Array.from(new Set(activeCategory.products.map(p => p.brand))).filter(b => b).map((brand, bIdx) => (
                      <Link href={`/search?brand=${brand}`} key={bIdx} className="px-5 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 transition-all text-[12px] font-bold text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md">
                        {brand}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
