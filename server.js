const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3002;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end(`internal server error: ${err.message}`);
    }
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Store active connections
  const activeConnections = new Map();

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);
    activeConnections.set(socket.id, socket);

    // Handle product subscription
    socket.on('subscribe-product', (productId) => {
      const room = `product-${productId}`;
      socket.join(room);
      console.log(`📦 Socket ${socket.id} subscribed to ${room}`);
    });

    // Handle product unsubscription
    socket.on('unsubscribe-product', (productId) => {
      const room = `product-${productId}`;
      socket.leave(room);
      console.log(`📤 Socket ${socket.id} unsubscribed from ${room}`);
    });

    // Handle category subscription
    socket.on('subscribe-category', (category) => {
      const room = `category-${category}`;
      socket.join(room);
      console.log(`📂 Socket ${socket.id} subscribed to ${room}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      activeConnections.delete(socket.id);
    });
  });

  // Make io accessible to API routes
  global.io = io;

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running`);
    });
});
