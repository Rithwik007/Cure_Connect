import { Router, Request, Response } from 'express';
import Vital from '../models/Vital';
import Patient from '../models/Patient';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

// Add a vital reading
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, value, unit, date } = req.body;
    
    // Vitals are linked to the User ID (patient role)
    const vital = await Vital.create({
      patientId: req.userId,
      type,
      value,
      unit,
      date: date || new Date()
    });

    res.status(201).json(vital);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get vitals for a specific patient (Doctor or the Patient themselves)
router.get('/:patientUserId', async (req: Request, res: Response) => {
  try {
    const { patientUserId } = req.params;
    
    // Security check: Only allow the doctor or the owner
    if (req.userRole !== 'doctor' && req.userId !== patientUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const vitals = await Vital.find({ patientId: patientUserId }).sort({ date: -1 });
    res.json(vitals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
