import { Router, Request, Response } from 'express';
import Report from '../models/Report';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

// Create Report
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData = { ...req.body, doctorId: req.userId };
    const report = await Report.create(reportData);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create report' });
  }
});

// Get Reports (optionally filter by visitId)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { visitId } = req.query;
    const query: any = { doctorId: req.userId };
    if (visitId) {
      query.visitId = visitId;
    }
    const reports = await Report.find(query);
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

export default router;
