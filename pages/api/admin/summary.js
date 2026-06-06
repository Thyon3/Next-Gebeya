import { isAuth, isAdmin } from '@/utils/auth';
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import db from "@/utils/db";

const handler = async (req, res) => {
  let user;

  try { user = await isAuth(req, res); } catch(e) { return; }

  if (!user.isAdmin) { return res.status(401).send({ message: 'Admin sign in required' }); }
  await db.connect();

  const ordersCount = await Order.countDocuments();
  const productsCount = await Product.countDocuments();
  const usersCount = await User.countDocuments();

  const ordersPriceGroup = await Order.aggregate([
    {
      $group: {
        _id: null,
        sales: { $sum: "$totalPrice" },
      },
    },
  ]);

  const ordersPrice =
    ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0;

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  
  res.send({
    ordersCount,
    productsCount,
    usersCount,
    ordersPrice,
    salesDate: salesData,
  });
};

export default handler;
