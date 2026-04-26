import express from 'express';
import Message from '../models/Message';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get messages for a specific room
router.get('/:roomId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
