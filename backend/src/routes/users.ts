 import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get user profile (protected)
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      message: 'User profile fetched successfully',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        isVerified: user.isVerified,
        verificationDetails: user.verificationDetails,
        coins: (user as any).coins ?? 0,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify user (protected)
router.post(
  '/verify',
  authMiddleware,
  [
    body('industry').notEmpty(),
    body('foundingYear').isInt({ min: 2000, max: new Date().getFullYear() }),
    body('teamSize').notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user?.id;
      const { industry, foundingYear, teamSize } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          isVerified: true,
          verificationDetails: {
            industry,
            foundingYear,
            teamSize,
          },
        },
        { new: true }
      );

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({
        message: 'User verified successfully',
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error('Verify user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Update user profile (protected)
router.put(
  '/profile',
  authMiddleware,
  [
    body('firstName').optional().notEmpty(),
    body('lastName').optional().notEmpty(),
    body('company').optional(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user?.id;
      const { firstName, lastName, company } = req.body;

      const updateData: any = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (company !== undefined) updateData.company = company;

      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({
        message: 'User profile updated successfully',
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
