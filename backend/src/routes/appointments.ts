import { Router, Request, Response } from 'express';
import Appointment from '../models/Appointment';
import Patient from '../models/Patient';
import User from '../models/User';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

// Book an appointment (Patient)
router.post('/', async (req: Request, res: Response) => {
  const { date, reason } = req.body;
  const patientId = req.userId;

  try {
    const doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'No doctor found in the system' });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId: doctor._id,
      date,
      reason,
      status: 'pending'
    });

    res.status(201).json(appointment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all appointments
router.get('/', async (req: Request, res: Response) => {
  try {
    const filter = req.userRole === 'doctor' ? {} : { patientId: req.userId };
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email age gender phone') // Added more fields
      .sort({ date: 1 });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Approve appointment (Doctor) - Creates Patient Profile using USER details
router.put('/:id/approve', async (req: Request, res: Response) => {
  if (req.userRole !== 'doctor') {
    return res.status(403).json({ message: 'Only doctors can approve appointments' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const user = await User.findById(appointment.patientId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Ensure Patient profile exists and is linked to THIS doctor
    let patient = await Patient.findOne({ userId: user._id, doctorId: req.userId });
    
    if (!patient) {
      patient = await Patient.create({
        userId: user._id,
        doctorId: req.userId,
        name: user.name,
        patientCode: `P-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        age: user.age || 0, // Using details from User record
        gender: user.gender || 'other',
        phone: user.phone || ''
      });
    }

    // 2. Update Appointment status to 'approved'
    appointment.status = 'approved';
    await appointment.save();

    res.json({ message: 'Appointment approved successfully', appointment });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
