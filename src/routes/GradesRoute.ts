import { Router } from "express";
import { updateGrades, getGradesBystudentCode,addActivity } from "../controller/addGradesController";

const router = Router();

router.put("/updateGrade", updateGrades);

router.get("/getGradesBystudentCode/:studentCode", getGradesBystudentCode);

router.post('/addActivity', addActivity);
export default router;
