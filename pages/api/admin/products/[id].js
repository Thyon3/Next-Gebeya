import { isAuth, isAdmin } from '@/utils/auth';
import Product from "@/models/Product";
import db from "@/utils/db";
import axios from "axios";
import { emitProductRestocked } from "@/utils/socket";

const handler = async (req, res) => {
  let user;
try { user = await isAuth(req, res); } catch(e) { return; }
if (!user.isAdmin) { return res.status(401).send({ message: 'Admin sign in required' }); }
  if (req.method === "GET") {
    return getHandler(req, res);
  } else if (req.method === "PUT") {
    return putHandler(req, res);
  } else if (req.method === "DELETE") {
    return deleteHandler(req, res);
  } else {
    return res.status(400).send({ message: "Method not allowed" });
  }
};

const getHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  res.send(product);
};

const putHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  
  if (product) {
    // Store old stock count to detect restocking
    const oldStock = product.countInStock;
    const newStock = req.body.countInStock;
    
    console.log('=== UPDATE PRODUCT DEBUG ===');
    console.log('Product ID:', req.query.id);
    console.log('Received brandLogo:', req.body.brandLogo);
    console.log('Received images:', req.body.images);
    
    // Update product fields
    product.name = req.body.name;
    product.slug = req.body.slug;
    product.price = req.body.price;
    product.category = req.body.category;
    product.image = req.body.image;
    product.images = Array.isArray(req.body.images) 
      ? req.body.images.filter(img => img && img.trim() !== '') 
      : [];
    product.brand = req.body.brand;
    product.brandLogo = req.body.brandLogo || "";
    product.countInStock = newStock;
    product.description = req.body.description;
    product.isFeatured = req.body.isFeatured;
    product.banner = req.body.banner || "";
    
    // Hero section enhancement fields
    product.isNewArrival = req.body.isNewArrival || false;
    product.isFlashSale = req.body.isFlashSale || false;
    product.flashSalePrice = req.body.flashSalePrice || null;
    product.flashSaleEndDate = req.body.flashSaleEndDate || null;
    product.discountPercentage = req.body.discountPercentage || 0;
    
    console.log('Before save - brandLogo:', product.brandLogo);
    console.log('Before save - images:', product.images);
    
    await product.save();
    
    console.log('After save - brandLogo:', product.brandLogo);
    console.log('After save - images:', product.images);
    console.log('=== END DEBUG ===');
    
    // Check if product was restocked (from 0 to >0)
    if (oldStock === 0 && newStock > 0) {
      console.log(`🔔 Product restocked: ${product.name} (${oldStock} → ${newStock})`);
      
      // Emit WebSocket event for real-time updates
      emitProductRestocked(product._id.toString(), {
        slug: product.slug,
        name: product.name,
        newStock: newStock,
      });
      
      // Trigger email notifications asynchronously
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        
        // Make internal API call to send notifications
        // Using setTimeout to not block the response
        setTimeout(async () => {
          try {
            const response = await axios.post(
              `${baseUrl}/api/stock-notifications/send`,
              { productId: product._id.toString() },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            console.log(`✅ Notification emails triggered: ${response.data.sent} sent`);
          } catch (emailError) {
            console.error('❌ Failed to trigger notification emails:', emailError.message);
          }
        }, 1000); // Delay 1 second to ensure response is sent first
        
      } catch (error) {
        console.error('Error triggering notifications:', error);
        // Don't fail the product update if notifications fail
      }
    }
    
    res.send({ 
      message: "Product updated successfully",
      restocked: oldStock === 0 && newStock > 0,
    });
  } else {
    res.status(404).send({ message: "Product not found" });
  }
};

const deleteHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  
  if (product) {
    await product.deleteOne();
    res.send({ message: "Product deleted successfully" });
  } else {
    res.status(404).send({ message: "Product not found" });
  }
};

export default handler;
