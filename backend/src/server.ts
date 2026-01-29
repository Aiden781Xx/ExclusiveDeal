import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import dealsRoutes from './routes/deals.js';
import claimsRoutes from './routes/claims.js';
import usersRoutes from './routes/users.js';
import paymentsRoutes from './routes/payments.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = (process.env.MONGO_URI || 'mongodb://localhost:27017/startup-benefits').trim();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server is running on port ${PORT}`);
});
