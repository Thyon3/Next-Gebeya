// API route to fetch real-time currency exchange rates
// Uses exchangerate-api.com with API key for better reliability and higher limits

const handler = async (req, res) => {
  try {
    const apiKey = process.env.EXCHANGERATE_API_KEY;
    
    if (!apiKey) {
      throw new Error('EXCHANGERATE_API_KEY is not configured');
    }

    // Use the authenticated API endpoint with your API key
    // Standard plan: 100,000 requests/month
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    // Check for API errors
    if (data.result === 'error') {
      throw new Error(data['error-type'] || 'API returned an error');
    }
    
    // Extract only the currencies we support
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD'];
    const rates = {};
    
    supportedCurrencies.forEach(currency => {
      rates[currency] = data.conversion_rates[currency] || 1;
    });

    // Cache for 1 hour
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    
    res.status(200).json({
      base: 'USD',
      rates: rates,
      lastUpdated: data.time_last_update_utc || new Date().toISOString(),
      nextUpdate: data.time_next_update_utc,
    });
  } catch (error) {
    console.error('Currency API Error:', error);
    
    // Fallback rates if API fails
    res.status(200).json({
      base: 'USD',
      rates: {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 149.50,
        CNY: 7.24,
        INR: 83.12,
        AUD: 1.53,
        CAD: 1.36,
      },
      lastUpdated: new Date().toISOString(),
      fallback: true,
    });
  }
};

export default handler;
