import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Testimonials({ settings: initialSettings = {} }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [socialProofStats, setSocialProofStats] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch fresh settings
        try {
          const { data: settingsData } = await axios.get('/api/site-settings');
          if (settingsData.success) {
            setSettings(settingsData.settings);
          }
        } catch (settingsError) {
          console.error('Failed to fetch settings:', settingsError);
        }

        // Fetch testimonials with stats
        const { data: testimonialsData } = await axios.get('/api/testimonials?stats=true');
        setTestimonials(testimonialsData.testimonials || []);
        setStats({
          averageRating: testimonialsData.averageRating || 0,
          totalReviews: testimonialsData.totalReviews || 0
        });

        // Fetch social proof stats
        try {
          const { data: statsData } = await axios.get('/api/social-proof-stats');
          setSocialProofStats(statsData || []);
        } catch (statsError) {
          console.error('Failed to fetch social proof stats:', statsError);
          setSocialProofStats([]);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
        setTestimonials([]);
        setStats({ averageRating: 0, totalReviews: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-white py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 py-16 mb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {settings.testimonialsHeading || 'What Our Customers Say'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {settings.testimonialsDescription || 'Join thousands of satisfied customers who trust us for quality products and excellent service'}
          </p>
          {stats.totalReviews > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-6 h-6 ${i < Math.floor(stats.averageRating) ? 'text-secondary-500' : 'text-gray-300 dark:text-gray-600'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                {stats.averageRating}/5 from {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
            {/* Quote Icon */}
            <div className="absolute top-8 left-8 text-primary-200 dark:text-primary-800">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            {/* Testimonial Content */}
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "{testimonials[activeIndex].text}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonials[activeIndex].image}
                  alt={testimonials[activeIndex].name}
                  className="w-16 h-16 rounded-full border-4 border-primary-100 dark:border-primary-800"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{testimonials[activeIndex].name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonials[activeIndex].role}</p>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    Purchased: {testimonials[activeIndex].product}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-xl transition-all duration-200"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-xl transition-all duration-200"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-primary-600 w-8'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Social Proof Stats */}
        {socialProofStats.length > 0 && (
          <div className={`grid grid-cols-2 md:grid-cols-${Math.min(socialProofStats.length, 4)} gap-6 mt-12 max-w-4xl mx-auto`}>
            {socialProofStats.map((stat) => {
              const colorMap = {
                primary: 'text-primary-600',
                success: 'text-success-600',
                secondary: 'text-secondary-600',
                info: 'text-info-600',
                warning: 'text-warning-600',
                danger: 'text-danger-600',
              };
              const colorClass = colorMap[stat.color] || 'text-primary-600';
              
              // Icon paths mapping
              const iconPaths = {
                users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
                star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
                heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
                support: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
                trophy: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
                chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
              };
              
              const iconPath = iconPaths[stat.icon] || iconPaths.users;
              
              return (
                <div key={stat._id} className="text-center">
                  <div className="flex justify-center mb-2">
                    <svg className={`w-10 h-10 ${colorClass}`} fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d={iconPath} clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className={`text-3xl md:text-4xl font-bold mb-1 ${colorClass}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
