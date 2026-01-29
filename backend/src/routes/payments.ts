import { Router, Response } from 'express';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import Razorpay from 'razorpay';
import User from '../models/User.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

const KEY_ID = process.env.RAZORPAY_KEY_ID?.trim() || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET?.trim() || '';

const razorpay = KEY_ID && KEY_SECRET
  ? new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })
  : null;

export const COIN_PACKS = [
  { coins: 100, amount: 99, label: '100 Coins', popular: false },
  { coins: 500, amount: 449, label: '500 Coins', popular: true },
  { coins: 1000, amount: 799, label: '1000 Coins', popular: false },
];

function getPackByCoins(coins: number) {
  return COIN_PACKS.find((p) => p.coins === coins) ?? null;
}

// Get coin packs (public for UI)
router.get('/packs', (req, res) => {
  res.json({ message: 'OK', data: COIN_PACKS });
});

// Create Razorpay order (protected)
router.post(
  '/create-order',
  authMiddleware,
  [body('coins').isInt({ min: 1 })],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!razorpay || !KEY_ID || !KEY_SECRET) {
        res.status(503).json({
          message: 'Payment gateway not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env.',
        });
        return;
      }

      const { coins } = req.body as { coins: number };
      const pack = getPackByCoins(coins);
      if (!pack) {
        res.status(400).json({ message: 'Invalid coin pack' });
        return;
      }

      const amountPaise = pack.amount * 100;
      const uid = String(req.user!.id).slice(-10);
      const t = Date.now().toString().slice(-8);
      const receipt = `c_${uid}_${t}`.slice(0, 40);

      const order = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: { coins: String(coins), userId: req.user!.id },
      });

      res.json({
        message: 'Order created',
        data: {
          orderId: order.id,
          amount: amountPaise,
          currency: order.currency,
          keyId: KEY_ID,
          coins: pack.coins,
          amountINR: pack.amount,
        },
      });
    } catch (e: unknown) {
      console.error('Create order error:', e);
      const err = e as { error?: { description?: string }; description?: string; message?: string };
      const msg =
        err?.error?.description || err?.description || err?.message || 'Failed to create order';
      res.status(500).json({ message: String(msg) });
    }
  }
);

// Verify payment and add coins (protected)
router.post(
  '/verify',
  authMiddleware,
  [
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
    body('coins').isInt({ min: 1 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!KEY_SECRET) {
        res.status(503).json({ message: 'Payment gateway not configured' });
        return;
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, coins } = req.body;

      const pack = getPackByCoins(coins);
      if (!pack) {
        res.status(400).json({ message: 'Invalid coin pack' });
        return;
      }

      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto
        .createHmac('sha256', KEY_SECRET)
        .update(payload)
        .digest('hex');

      if (expected !== razorpay_signature) {
        res.status(400).json({ message: 'Payment verification failed' });
        return;
      }

      const user = await User.findByIdAndUpdate(
        req.user!.id,
        { $inc: { coins } },
        { new: true }
      );

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({
        message: 'Payment verified. Coins added successfully.',
        data: {
          coinsAdded: coins,
          newBalance: user.coins,
        },
      });
    } catch (e) {
      console.error('Verify payment error:', e);
      res.status(500).json({ message: 'Verification failed' });
    }
  }
);

export default router;
