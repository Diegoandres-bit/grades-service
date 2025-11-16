import { Router } from 'express';
import { getGradesStudent, getGradesHandler } from '../controller/studenDashboardController';

const router = Router();

router.get('/', getGradesStudent);

router.get('/:id', getGradesHandler);

export default router;
