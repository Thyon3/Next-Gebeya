import { isAuth, isAdmin } from '@/utils/auth';
import User from "@/models/User";
import db from "@/utils/db";

const handler = async (req, res) => {
  let user;
try { user = await isAuth(req, res); } catch(e) { return; }
if (!user.isAdmin) { return res.status(401).send({ message: 'Admin sign in required' }); }
  if (req.method === "DELETE") {
    return deleteHandler(req, res);
  } else {
    return res.status(400).send({ message: "Method not allowed" });
  }
};

const deleteHandler = async (req, res) => {
  await db.connect();
  const user = await User.findById(req.query.id);
  
  if (user) {
    if (user.isAdmin) {
      return res.status(400).send({ message: "Cannot delete admin user" });
    }
    await user.deleteOne();
    res.send({ message: "User deleted successfully" });
  } else {
    res.status(404).send({ message: "User not found" });
  }
};

export default handler;
