import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Store } from "@/utils/Store";
import { currencyMetadata } from "@/utils/currency";

// --- Mini Product Card ---
function MiniProductCard({ product, currencySymbol }) {
    if (!product) {
        return (
            <div className="animate-pulse flex-1 min-w-0">
                <div className="aspect-square bg-gray-100 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
        );
    }

    const price = product.isFlashSale ? product.flashSalePrice : product.price;
    const original = product.price;
    const hasDiscount = product.discountPercentage > 0;

    return (
        <Link href={`/product/${product.slug}`} className="flex-1 min-w-0 group">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2 border border-gray-100">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <p className="text-[11px] font-black text-gray-900 leading-tight truncate">
                {currencySymbol}{price?.toFixed(2)}
            </p>
            {hasDiscount && (
                <p className="text-[10px] text-gray-400 line-through leading-none">
                    {currencySymbol}{original?.toFixed(2)}
                </p>
            )}
            <p className="text-[9px] text-gray-500 mt-0.5 font-medium">Popular picks</p>
        </Link>
    );
}

// --- Stat Badge ---
function StatBadge({ value, label }) {
    return (
        <div className="text-white">
            <div className="text-xl md:text-2xl font-black leading-none">{value}</div>
            <div className="text-[11px] text-white/80 mt-0.5 leading-tight max-w-[120px]">{label}</div>
        </div>
    );
}

// --- Main Section ---
export default function SuperBuyerSection() {
    const { state } = useContext(Store);
    const { currency } = state;
    const currencySymbol = currencyMetadata[currency]?.symbol || currency;

    const [bulkProducts, setBulkProducts] = useState(Array(3).fill(null));
    const [buyAgainProducts, setBuyAgainProducts] = useState(Array(3).fill(null));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch 6 random products, split into two panels of 3
                const { data } = await axios.get("/api/products/random?count=6", {
                    headers: { "Cache-Control": "no-cache" },
                });

                const all = data.products || [];
                setBulkProducts(all.slice(0, 3).concat(Array(Math.max(0, 3 - all.slice(0, 3).length)).fill(null)));
                setBuyAgainProducts(all.slice(3, 6).concat(Array(Math.max(0, 3 - all.slice(3, 6).length)).fill(null)));
            } catch (err) {
                console.error("SuperBuyerSection: failed to load products", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="relative w-full rounded-2xl overflow-hidden mb-12">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/shopybybrand.jpg')" }}
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Content */}
            <div className="relative z-10 px-6 md:px-10 pt-8 pb-0">
                {/* Top Row: Brand + Stats */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                    {/* Left: Branding */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-white text-3xl font-black tracking-tight">
                                Super<span className="text-amber-400">Buyer</span>
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-white/90 text-xs font-semibold">
                            <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2C6.686 2 4 4.686 4 8c0 5.25 6 10 6 10s6-4.75 6-10c0-3.314-2.686-6-6-6zm0 8a2 2 0 100-4 2 2 0 000 4z" /></svg>
                                Tax exemptions
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m4 0h1M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Express payment
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                Financial support
                            </span>
                        </div>
                        <Link href="/search">
                            <button className="mt-1 w-fit bg-white text-gray-900 text-sm font-black px-6 py-2.5 rounded-full hover:bg-amber-400 hover:text-black transition-all duration-200 shadow-lg active:scale-95">
                                Shop now
                            </button>
                        </Link>
                    </div>

                    {/* Right: Stats Grid */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                        <StatBadge value="5M+" label="Factory direct supply" />
                        <StatBadge value="20M+" label="Value dropshipping items" />
                        <StatBadge value="10" label="Local warehouses worldwide" />
                        <StatBadge value="24H" label="Personalized sourcing service" />
                    </div>
                </div>

                {/* Bottom Row: Two product panel cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Panel 1: Bulk Saver Hub */}
                    <div className="bg-white rounded-t-xl p-4 shadow-xl">
                        <h3 className="text-[15px] font-black text-gray-900 text-center mb-4">Bulk Saver Hub</h3>
                        <div className="flex gap-3">
                            {bulkProducts.map((product, i) => (
                                <MiniProductCard
                                    key={product?.slug || `bulk-skeleton-${i}`}
                                    product={product}
                                    currencySymbol={currencySymbol}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Panel 2: Buy Again */}
                    <div className="bg-white rounded-t-xl p-4 shadow-xl">
                        <h3 className="text-[15px] font-black text-gray-900 text-center mb-4">Buy again</h3>
                        <div className="flex gap-3">
                            {buyAgainProducts.map((product, i) => (
                                <MiniProductCard
                                    key={product?.slug || `again-skeleton-${i}`}
                                    product={product}
                                    currencySymbol={currencySymbol}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
