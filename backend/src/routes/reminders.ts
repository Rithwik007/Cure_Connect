import { Router, Request, Response } from 'express';
import Reminder from '../models/Reminder';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

// Get my reminders
router.get('/', async (req: Request, res: Response) => {
  try {
    const reminders = await Reminder.find({ patientId: req.userId }).sort({ time: 1 });
    res.json(reminders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add a reminder
router.post('/', async (req: Request, res: Response) => {
  try {
    const { medicationName, dosage, time } = req.body;
    const reminder = await Reminder.create({
      patientId: req.userId,
      medicationName,
      dosage,
      time,
      active: true
    });
    res.status(201).json(reminder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle reminder
router.put('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    
    reminder.active = !reminder.active;
    await reminder.save();
    res.json(reminder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete reminder
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, patientId: req.userId });
    res.json({ message: 'Reminder deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
