import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import Deal from '../models/Deal.js';

const router = Router();

// Get all deals with filters
router.get(
  '/',
  [
    query('category').optional().isString(),
    query('isLocked').optional().isBoolean(),
    query('search').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { category, isLocked, search } = req.query;

      const filter: any = { status: 'active' };

      if (category && category !== '' && category !== 'all') {
        filter.category = { $regex: new RegExp(`^${String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
      }

      if (isLocked !== undefined) {
        filter.isLocked = isLocked === 'true';
      }

      if (search && search !== '') {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'partner.name': { $regex: search, $options: 'i' } },
        ];
      }

      const deals = await Deal.find(filter).sort({ createdAt: -1 });

      res.json({
        message: 'Deals fetched successfully',
        count: deals.length,
        data: deals,
      });
    } catch (error) {
      console.error('Get deals error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Get single deal
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id);

    if (!deal) {
      res.status(404).json({ message: 'Deal not found' });
      return;
    }

    res.json({
      message: 'Deal fetched successfully',
      data: deal,
    });
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
