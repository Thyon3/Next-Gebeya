import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import Category from '@/models/Category';
import Product from '@/models/Product';
import db from '@/utils/db';

const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('Admin sign in required');
  }

  await db.connect();

  if (req.method === 'GET') {
    try {
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

      res.status(200).json(categoriesWithCounts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }

  };

export default handler;
