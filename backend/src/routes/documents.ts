import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Document from '../models/Document';
import { protect } from '../middleware/auth';

const router = Router();

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(protect);

// Upload a document
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { name, category, patientId } = req.body;
    
    const doc = await Document.create({
      patientId: patientId || req.userId,
      uploaderId: req.userId,
      name: name || req.file.originalname,
      category: category || 'Lab Report',
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      date: new Date()
    });

    res.status(201).json(doc);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get documents for a patient
router.get('/:patientUserId', async (req: Request, res: Response) => {
  try {
    const { patientUserId } = req.params;
    
    // Security: Doctor or owner only
    if (req.userRole !== 'doctor' && req.userId !== patientUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const docs = await Document.find({ patientId: patientUserId }).sort({ date: -1 });
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a document
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    
    // Only uploader or doctor can delete
    if (req.userRole !== 'doctor' && req.userId !== doc.uploaderId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove file from disk
    const filePath = path.join(__dirname, '../../', doc.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await doc.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
