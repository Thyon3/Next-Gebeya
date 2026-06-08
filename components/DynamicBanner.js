import React, { useState, useEffect } from 'react';

const BANNER_IMAGES = [
    '/bannerimage/image.jpg',
    '/bannerimage/image1.jpg',
    '/bannerimage/image2.jpg',
    '/bannerimage/image3.jpg',
    '/bannerimage/image4.jpg',
    '/bannerimage/image5.jpg',
    '/bannerimage/iamge6.jpg', // note the typo in filename provided by user/ls
    '/bannerimage/image7.jpg',
];

const BANNER_CONTENT = [
    {
        title: "MEGA FLASH SALE",
        subtitle: "Up to 70% OFF on all electronics",
        badge: "Limited Time",
        color: "from-red-600 to-orange-500"
    },
    {
        title: "NEW SEASON COLLECTIONS",
        subtitle: "Discover the latest trends in fashion",
        badge: "New Arrival",
        color: "from-blue-600 to-indigo-500"
    },
    {
        title: "HOME ESSENTIALS",
        subtitle: "Premium quality for your comfort",
        badge: "Big Savings",
        color: "from-emerald-600 to-teal-500"
    },
    {
        title: "TECH EXPLOSION",
        subtitle: "The future is here. Grab yours now.",
        badge: "Tech deals",
        color: "from-purple-600 to-pink-500"
    },
];

export default function DynamicBanner() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % BANNER_IMAGES.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [isPaused]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % BANNER_IMAGES.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length);
    };

    return (
        <div
            className="w-full relative h-[220px] md:h-[320px] lg:h-[400px] group overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Images with Cross-fade */}
            {BANNER_IMAGES.map((img, index) => (
                <div
                    key={img}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <img
                        src={img}
                        alt={`Banner ${index}`}
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                </div>
            ))}

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center px-8 md:px-20 lg:px-32">

                {/* Dynamic Text Content */}
                {BANNER_IMAGES.map((_, index) => {
                    const content = BANNER_CONTENT[index % BANNER_CONTENT.length];
                    return (
                        <div
                            key={index}
                            className={`transition-all duration-1000 absolute left-8 md:left-20 lg:left-32 ${index === currentSlide ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                                }`}
                        >
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] md:text-xs font-black text-white uppercase tracking-widest mb-4 bg-gradient-to-r ${content.color} shadow-lg animate-bounce`}>
                                {content.badge}
                            </span>
                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl mb-4 italic tracking-tighter">
                                {content.title}
                            </h2>
                            <p className="text-sm md:text-xl text-white/90 font-medium max-w-lg mb-8 drop-shadow-lg">
                                {content.subtitle}
                            </p>
                            <div className="flex gap-4">
                                <button className="px-8 py-3 bg-white text-black font-black rounded-full hover:bg-amber-400 hover:scale-105 transition-all shadow-xl active:scale-95 text-xs md:text-sm uppercase tracking-wider">
                                    Shop Now
                                </button>
                                <button className="px-8 py-3 border-2 border-white/30 backdrop-blur-md text-white font-black rounded-full hover:bg-white/10 transition-all text-xs md:text-sm uppercase tracking-wider">
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 active:scale-90"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 active:scale-90"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Progress Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                {BANNER_IMAGES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all duration-500 rounded-full ${index === currentSlide ? 'w-10 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
