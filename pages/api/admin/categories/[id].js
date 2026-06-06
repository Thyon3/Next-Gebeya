import { isAuth, isAdmin } from '@/utils/auth';
import Category from '@/models/Category';
import Product from '@/models/Product';
import db from '@/utils/db';

const handler = async (req, res) => {
  let user;
try { user = await isAuth(req, res); } catch(e) { return; }
if (!user.isAdmin) { return res.status(401).send({ message: 'Admin sign in required' }); }
  const { id } = req.query;
  const categoryName = decodeURIComponent(id); // Decode the category name from URL

  await db.connect();

  if (req.method === 'PUT') {
    try {
      // Verify category exists in products
      const productCount = await Product.countDocuments({ category: categoryName });
      if (productCount === 0) {
        return res.status(404).json({ message: 'Category not found in products' });
      }

      const { icon, gradient, bgColor, image, description, order } = req.body;

      // Update or create category styling
      let category = await Category.findOne({ name: categoryName });
      
      if (category) {
        // Update existing
        category.icon = icon !== undefined ? icon : category.icon;
        category.gradient = gradient || category.gradient;
        category.bgColor = bgColor || category.bgColor;
        category.image = image !== undefined ? image : category.image;
        category.description = description !== undefined ? description : category.description;
        category.order = order !== undefined ? order : category.order;
        await category.save();
      } else {
        // Create new styling entry
        category = await Category.create({
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
          icon: icon || '📦',
          gradient: gradient || 'from-blue-500 to-cyan-500',
          bgColor: bgColor || 'bg-blue-50 dark:bg-blue-900/20',
          image: image || '',
          description: description || '',
          order: order || 0,
        });
      }

      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
