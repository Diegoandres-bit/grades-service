import {Router} from 'express';

import {gradeCriteria,totalPercentage} from '../controller/subjectCriteriaController';

const router=Router();

router.get('/criteriagrade',gradeCriteria);

router.get('/totalPercentage',totalPercentage);

export default router;