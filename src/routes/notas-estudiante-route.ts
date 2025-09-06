import { Router } from 'express';
import { getGradesStudent, getNotasMateriaEstudianteById } from '../controller/studenDashboardController';

const router = Router();

router.get('/', getGradesStudent);

router.get('/:id', getNotasMateriaEstudianteById);

export default router;
