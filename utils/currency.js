// Currency metadata
export const currencyMetadata = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
};

// Cache for exchange rates
let cachedRates = null;
let lastFetchTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Fetch real-time exchange rates
export const fetchExchangeRates = async () => {
  // Return cached rates if still valid
  if (cachedRates && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    return cachedRates;
  }

  try {
    const response = await fetch('/api/currency/rates');
    const data = await response.json();
    
    cachedRates = data.rates;
    lastFetchTime = Date.now();
    
    // Store in localStorage for offline access
    if (typeof window !== 'undefined') {
      localStorage.setItem('exchangeRates', JSON.stringify({
        rates: data.rates,
        timestamp: Date.now(),
      }));
    }
    
    return data.rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    
    // Try to use cached rates from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('exchangeRates');
      if (stored) {
        const { rates } = JSON.parse(stored);
        return rates;
      }
    }
    
    // Fallback to default rates
    return {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.50,
      CNY: 7.24,
      INR: 83.12,
      AUD: 1.53,
      CAD: 1.36,
    };
  }
};

// Get exchange rates (with caching)
export const getExchangeRates = () => {
  // Try to get from localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('exchangeRates');
    if (stored) {
      const { rates, timestamp } = JSON.parse(stored);
      // Use cached rates if less than 1 hour old
      if (Date.now() - timestamp < CACHE_DURATION) {
        return rates;
      }
    }
  }
  
  // Return fallback rates (will be updated by fetchExchangeRates)
  return {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    CNY: 7.24,
    INR: 83.12,
    AUD: 1.53,
    CAD: 1.36,
  };
};

export const formatPrice = (price, currencyCode = 'USD', rates = null) => {
  const metadata = currencyMetadata[currencyCode];
  if (!metadata) return `$${price}`;
  
  // Use provided rates or get from cache
  const exchangeRates = rates || getExchangeRates();
  const rate = exchangeRates[currencyCode] || 1;
  
  const convertedPrice = (price * rate).toFixed(2);
  
  // Format with proper decimal places
  if (currencyCode === 'JPY') {
    return `${metadata.symbol}${Math.round(price * rate).toLocaleString()}`;
  }
  
  return `${metadata.symbol}${parseFloat(convertedPrice).toLocaleString()}`;
};

export const getDefaultCurrency = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currency') || 'USD';
  }
  return 'USD';
};

export const setDefaultCurrency = (currencyCode) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currency', currencyCode);
  }
};
