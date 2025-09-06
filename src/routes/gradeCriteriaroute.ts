import { Router } from "express";
import { gradeCriteria } from "../controller/subjectCriteriaController";   
const router = Router();

router.put('/:id', gradeCriteria);
export default router;