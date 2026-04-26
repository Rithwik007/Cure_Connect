import { Router, Request, Response } from 'express';
import Visit from '../models/Visit';
import Patient from '../models/Patient';
import Appointment from '../models/Appointment';
import { protect } from '../middleware/auth';

const router = Router();

// Public route for Pharmacist Verification (No login required)
router.get('/public/:id', async (req: Request, res: Response) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name email');
      
    if (!visit) {
      return res.status(404).json({ success: false, error: 'Prescription not found' });
    }

    // Return only necessary data for the pharmacist
    const publicData = {
      date: visit.date,
      prescription: visit.prescription,
      diagnosis: visit.diagnosis,
      nextAppointment: visit.nextAppointment,
      patient: visit.patientId,
      doctor: visit.doctorId
    };

    res.json({ success: true, data: publicData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Verification system error' });
  }
});

router.use(protect);

// Get my own visit history (Patient)
router.get('/my-history', async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findOne({ userId: req.userId });
    if (!patient) return res.json({ data: [] });

    const visits = await Visit.find({ patientId: patient._id }).sort({ date: -1 });
    res.json({ data: visits });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create Visit (Doctor)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.body;
    const visitData = { ...req.body, doctorId: req.userId };
    const visit = await Visit.create(visitData);

    // After creating a visit, find the patient profile to get their User ID
    const patientProfile = await Patient.findById(patientId);
    
    if (patientProfile && patientProfile.userId) {
      // Mark any 'approved' appointments for this patient user as 'completed'
      const updateResult = await Appointment.updateMany(
        { 
          patientId: patientProfile.userId, 
          status: 'approved' 
        },
        { status: 'completed' }
      );
      console.log(`Marked ${updateResult.modifiedCount} appointments as completed for patient ${patientProfile.name}`);
    }

    res.status(201).json({ success: true, data: visit });
  } catch (error: any) {
    console.error('Visit Creation Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all visits (Doctor)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    const query: any = { doctorId: req.userId };
    if (patientId) {
      query.patientId = patientId;
    }
    const visits = await Visit.find(query).sort({ date: -1 });
    res.json({ success: true, data: visits });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch visits' });
  }
});

// Get single Visit
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ success: false, error: 'Visit not found' });
    }

    // Authorization: Check if user is the doctor OR the patient who owns this record
    const isDoctor = visit.doctorId.toString() === req.userId;
    
    let isPatient = false;
    const patientProfile = await Patient.findOne({ userId: req.userId });
    if (patientProfile && visit.patientId.toString() === patientProfile._id.toString()) {
      isPatient = true;
    }

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this visit' });
    }

    res.json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch visit' });
  }
});

// Update Visit
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const visit = await Visit.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.userId },
      req.body,
      { new: true }
    );
    if (!visit) {
      return res.status(404).json({ success: false, error: 'Visit not found' });
    }
    res.json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update visit' });
  }
});

export default router;
