import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';
import { config } from '../config';
import { protect } from '../middleware/auth';

const router = Router();

// Routes needing protection
router.delete('/account', protect);

const generateToken = (id: string) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: '30d',
  });
};

// Register
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password, role, age, gender, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (role === 'doctor') {
      const doctorExists = await User.findOne({ role: 'doctor' });
      if (doctorExists) {
        return res.status(400).json({ message: 'A doctor is already registered on this platform. Only one doctor is allowed.' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      age,
      gender,
      phone
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get Current Doctor (Primary)
router.get('/doctor', protect, async (req: Request, res: Response) => {
  try {
    const doctor = await User.findOne({ role: 'doctor' }).select('name email phone');
    if (!doctor) {
      return res.status(404).json({ message: 'No doctor registered yet' });
    }
    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get Doctor by ID
router.get('/doctor/:id', async (req: Request, res: Response) => {
  try {
    const doctor = await User.findById(req.params.id).select('name email phone');
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Account (Self)
router.delete('/account', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If patient, delete their clinical record too
    if (user.role === 'patient') {
      const Patient = mongoose.model('Patient');
      await Patient.deleteMany({ userId: user._id });
    }

    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});



export default router;
