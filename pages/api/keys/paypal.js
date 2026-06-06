import { isAuth, isAdmin } from '@/utils/auth';

const handler = async (req, res) => {
  let user;
try { user = await isAuth(req, res); } catch(e) { return; }
res.send(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb");
};

export default handler;
