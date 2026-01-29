import { Router, Response } from 'express';
import { param, validationResult } from 'express-validator';
import Claim from '../models/Claim.js';
import Deal from '../models/Deal.js';
import User from '../models/User.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { generateClaimCode } from '../utils/auth.js';

const router = Router();

// Get user's claimed deals (protected) - MUST come before /:claimId
router.get('/user/claims', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const claims = await Claim.find({ userId }).populate('dealId').sort({ createdAt: -1 });

    res.json({
      message: 'Claims fetched successfully',
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Claim a deal (protected)
router.post('/:dealId/claim', authMiddleware, [param('dealId').isMongoId()], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { dealId } = req.params;
    const userId = req.user?.id;

    // Check if deal exists
    const deal = await Deal.findById(dealId);
    if (!deal) {
      res.status(404).json({ message: 'Deal not found' });
      return;
    }

    // Check if deal is active
    if (deal.status !== 'active') {
      res.status(400).json({ message: 'Deal is no longer available' });
      return;
    }

    // Check user verification if deal is locked
    if (deal.isLocked && deal.requiredVerification !== 'none') {
      const user = await User.findById(userId);
      if (!user?.isVerified) {
        res.status(403).json({
          message: 'User verification required to claim this deal',
          requiredVerification: deal.requiredVerification,
        });
        return;
      }
    }

    // Check if user already claimed this deal
    const existingClaim = await Claim.findOne({ userId, dealId });
    if (existingClaim) {
      res.status(409).json({ message: 'You have already claimed this deal' });
      return;
    }

    // Create claim
    const claimCode = generateClaimCode();
    const claim = new Claim({
      userId,
      dealId,
      claimCode,
      status: deal.isLocked ? 'pending' : 'claimed',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await claim.save();

    // Increment deal claims count
    deal.claimsCount += 1;
    await deal.save();

    res.status(201).json({
      message: 'Deal claimed successfully',
      data: {
        claimId: claim._id,
        dealId: deal._id,
        status: claim.status,
        claimCode,
      },
    });
  } catch (error) {
    console.error('Claim deal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get claim details (protected)
router.get('/:claimId', authMiddleware, [param('claimId').isMongoId()], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { claimId } = req.params;
    const userId = req.user?.id;

    const claim = await Claim.findById(claimId).populate('dealId');

    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    // Verify ownership
    if (claim.userId.toString() !== userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    res.json({
      message: 'Claim fetched successfully',
      data: claim,
    });
  } catch (error) {
    console.error('Get claim error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
