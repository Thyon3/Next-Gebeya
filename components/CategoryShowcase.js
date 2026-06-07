import Link from 'next/link';
import Image from 'next/image';

export default function CategoryShowcase({ categories = [] }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  // Slice categories for the grid (6 items as in the image)
  const gridCategories = categories.slice(0, 6);

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10 mt-16 font-sans">
        Shop by category
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT: Featured Brand Card */}
        <div className="lg:col-span-5 relative rounded-xl overflow-hidden bg-gradient-to-br from-[#a7f3ff] via-[#d0fbff] to-[#f4fdff] p-8 flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-5xl font-[900] italic text-gray-900 mb-2 tracking-tighter">Viva</h3>
            <p className="text-gray-700 font-bold mb-6">Your fashion choice</p>
            <Link href="/search?category=Clothing">
              <button className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg">
                Shop now
              </button>
            </Link>
          </div>

          {/* Model Image - Absolute positioned to the right */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60" className="w-full h-full object-cover object-center" alt="" />
          </div>

          {/* Featured items overlay at the bottom */}
          <div className="relative z-10 grid grid-cols-3 gap-3 mt-4">
            {/* Small product cards in the blue box */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded p-1 shadow-md">
                <div className="aspect-[4/5] bg-gray-50 rounded overflow-hidden mb-2">
                  <img src={categories[i]?.image || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80`} className="w-full h-full object-cover" />
                </div>
                <div className="px-1 pb-1">
                  <div className="text-[10px] font-bold text-gray-900 leading-none">ETB{Math.floor(Math.random() * 2000 + 1000)}.00</div>
                  <div className="text-[8px] text-gray-400 line-through">ETB{Math.floor(Math.random() * 4000 + 2000)}.00</div>
                  <div className="flex items-center gap-0.5 text-[8px] font-bold text-amber-500 mt-1">
                    <span>★</span> 4.{Math.floor(Math.random() * 9)}
                    <span className="text-gray-400 font-normal">| 500+ sold</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Category Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          {gridCategories.map((category) => (
            <Link
              key={category.name}
              href={`/search?category=${encodeURIComponent(category.name)}`}
              className="group h-[160px]"
            >
              <div className="bg-[#f2f2f2] dark:bg-gray-800 rounded-xl p-6 h-full flex justify-between relative overflow-hidden transition-all hover:shadow-lg">
                <div className="z-10 w-1/2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-red-600 transition-colors">
                    {category.name}
                  </h4>
                </div>

                <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-500">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-contain object-right-bottom mix-blend-multiply dark:mix-blend-normal"
                    />
                  ) : (
                    <span className="text-5xl">{category.icon || '📦'}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
