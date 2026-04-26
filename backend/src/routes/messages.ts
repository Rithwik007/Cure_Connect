import express from 'express';
import Message from '../models/Message';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get messages for a specific room
router.get('/:roomId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save a message manually (Fallback/REST)
router.post('/', protect, async (req, res) => {
  try {
    const { roomId, message, senderName, time } = req.body;
    const newMessage = await Message.create({
      roomId,
      message,
      senderName,
      time,
      senderId: req.userId
    });
    res.status(201).json(newMessage);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
