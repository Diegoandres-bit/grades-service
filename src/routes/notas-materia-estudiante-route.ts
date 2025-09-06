import {Router} from 'express';

import {getGradesFromSubjectStudent,finalGrade} from '../controller/studentGradesController';

const router=Router();

router.get('/subject',getGradesFromSubjectStudent);

router.get('/finalGrade',finalGrade);

export default router;
