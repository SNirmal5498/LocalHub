import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth.routes.js';
import businessRoutes from './server/routes/business.routes.js';
import productRoutes from './server/routes/product.routes.js';
import serviceRoutes from './server/routes/service.routes.js';
import offerRoutes from './server/routes/offer.routes.js';
import orderRoutes from './server/routes/order.routes.js';
import reviewRoutes from './server/routes/review.routes.js';
import favoriteRoutes from './server/routes/favorite.routes.js';
import analyticsRoutes from './server/routes/analytics.routes.js';
import adminRoutes from './server/routes/admin.routes.js';
import notificationRoutes from './server/routes/notification.routes.js';
import messageRoutes from './server/routes/message.routes.js';
import categoryRoutes from './server/routes/category.routes.js';
import uploadRoutes from './server/routes/upload.routes.js';
import { connectMongo } from './server/db/mongo.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

async function startServer() {
  try {
    // Connect to real MongoDB via Mongoose
    await connectMongo();

    if (process.env.NODE_ENV === 'production') {
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 LocalHub Full-Stack Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
