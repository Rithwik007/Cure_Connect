import { Router, Request, Response } from 'express';
import Prescription from '../models/Prescription';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

// Create Prescription
router.post('/', async (req: Request, res: Response) => {
  try {
    const prescriptionData = { ...req.body, doctorId: req.userId };
    const prescription = await Prescription.create(prescriptionData);
    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create prescription' });
  }
});

// Get Prescriptions (optionally filter by visitId)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { visitId } = req.query;
    const query: any = { doctorId: req.userId };
    if (visitId) {
      query.visitId = visitId;
    }
    const prescriptions = await Prescription.find(query);
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch prescriptions' });
  }
});

export default router;
