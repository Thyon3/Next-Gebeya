/**
 * Migration Script: Add soldCount to Products
 * 
 * This script adds the soldCount field to all existing products.
 * Run this once after deploying the soldCount feature.
 * 
 * Usage:
 *   node scripts/add-sold-count.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function addSoldCount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    // Update all products that don't have soldCount
    const result = await Product.updateMany(
      { soldCount: { $exists: false } },
      { $set: { soldCount: 0 } }
    );

    console.log('\n=== Migration Complete ===');
    console.log(`Updated ${result.modifiedCount} products with soldCount field`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
addSoldCount();
