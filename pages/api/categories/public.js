import Category from '@/models/Category';
import Product from '@/models/Product';
import db from '@/utils/db';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await db.connect();
    
    // Get all unique categories from products
    const productCategories = await Product.distinct('category');
    
    // Get styling info from Category collection
    const categoryStyles = await Category.find({}).lean();
    const styleMap = {};
    categoryStyles.forEach(cat => {
      styleMap[cat.name] = cat;
    });
    
    // Combine product categories with their styling
    const categoriesWithCounts = await Promise.all(
      productCategories.map(async (categoryName) => {
        const productCount = await Product.countDocuments({ category: categoryName });
        const style = styleMap[categoryName] || {};
        
        return {
          name: categoryName,
          icon: style.icon || '📦',
          gradient: style.gradient || 'from-blue-500 to-cyan-500',
          bgColor: style.bgColor || 'bg-blue-50 dark:bg-blue-900/20',
          image: style.image || '',
          description: style.description || '',
          order: style.order || 0,
          productCount,
        };
      })
    );

    // Sort by order, then by name
    categoriesWithCounts.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });

    // Filter out categories with no products
    const activeCategories = categoriesWithCounts.filter(cat => cat.productCount > 0);

    
    res.status(200).json({
      success: true,
      categories: activeCategories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

export default handler;
