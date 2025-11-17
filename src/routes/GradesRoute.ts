import { Router } from "express";
import { updateGrades, getGradesBystudentCode,addActivity,getGradesByCourseId } from "../controller/addGradesController";

const router = Router();

router.put("/updateGrade", updateGrades);

router.get("/getGradesBystudentCode/:studentCode", getGradesBystudentCode);

router.post('/addActivity', addActivity);

router.get("/getGradesByCourseId/:courseId", getGradesByCourseId);



export default router;
