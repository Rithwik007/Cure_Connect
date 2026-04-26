import { Router, Request, Response } from 'express';
import Patient from '../models/Patient';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

// Create Patient (Manual)
router.post('/', async (req: Request, res: Response) => {
  try {
    const patientData = { ...req.body, doctorId: req.userId };
    const patient = await Patient.create(patientData);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create patient' });
  }
});

// Get all Patients for the logged-in doctor
router.get('/', async (req: Request, res: Response) => {
  try {
    const patients = await Patient.find({ doctorId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch patients' });
  }
});

// Get single Patient
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // Authorization: Check if user is the doctor OR the patient themselves
    const isDoctor = patient.doctorId.toString() === req.userId;
    const isSelf = patient.userId && patient.userId.toString() === req.userId;

    if (!isDoctor && !isSelf) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this patient' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch patient' });
  }
});

// Update Patient
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.userId },
      req.body,
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update patient' });
  }
});

export default router;
