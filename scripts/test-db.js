require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testConnection() {
    console.log('Testing connection to:', process.env.MONGODB_URL);
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Successfully connected to MongoDB Atlas!');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:', collections.map(c => c.name));
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();
