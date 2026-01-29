import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';

const router = Router();

// Register endpoint
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, firstName, lastName, company } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({ message: 'User already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        company: company || '',
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id.toString(), user.email, user.isVerified);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Login endpoint
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate token
      const token = generateToken(user._id.toString(), user.email, user.isVerified);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
