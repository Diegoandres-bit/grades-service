import { Router } from "express";
import { updateCriteriaAllStudents } from "../controller/gradeCriteriaController";

const router = Router();

router.put("/updateCriteria", updateCriteriaAllStudents);

export default router;