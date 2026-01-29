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
const MONGO_URI = (process.env.MONGO_URI || '').trim();

/* ===== FINAL CORS CONFIG ===== */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.FRONTEND_URL!,
    ]
  })
);

app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✓ Connected to MongoDB"))
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});
