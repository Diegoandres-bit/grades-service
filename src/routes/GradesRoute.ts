import { Router } from "express";
import { addGrades, getGradesBystudentCode } from "../controller/addGradesController";

const router = Router();

router.post("/addGrade", addGrades);

router.get("/getGradesBystudentCode/:studentCode", getGradesBystudentCode);

export default router;
