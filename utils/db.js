import mongoose from "mongoose";

const connection = {};

async function connect() {
  // Check if already connected
  if (connection.isConnected && mongoose.connection.readyState === 1) {
    console.log("Already connected to database");
    return;
  }
  
  // Check existing connections
  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;
    if (connection.isConnected === 1) {
      console.log("Using existing database connection");
      return;
    }
    // Disconnect if connection is in bad state
    if (connection.isConnected !== 0) {
      await mongoose.disconnect();
    }
  }
  
  try {
    const db = await mongoose.connect(process.env.MONGODB_URL);
    console.log("New database connection established");
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

async function disconnect() {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === "production") {
      await mongoose.disconnect();
      connection.isConnected = false;
      console.log("Database disconnected");
    } else {
      console.log("Database not disconnected in development mode");
    }
  }
}

function convertDocToObj(doc) {
  doc._id = doc._id.toString();
  doc.createdAt = doc.createdAt.toString();
  doc.updatedAt = doc.updatedAt.toString();
  
  // Convert flashSaleEndDate if it exists
  if (doc.flashSaleEndDate) {
    doc.flashSaleEndDate = doc.flashSaleEndDate.toString();
  }
  
  return doc;
}

const db = { connect, disconnect, convertDocToObj };
export default db;
