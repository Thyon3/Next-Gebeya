import Product from '@/models/Product';
import db from '@/utils/db';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await db.connect();
    
    // Get all unique categories with product counts
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          products: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          sampleProducts: { $slice: ['$products', 3] }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    
    res.status(200).json({
      success: true,
      categories,
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
