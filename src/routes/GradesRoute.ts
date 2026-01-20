// src/routes/grades.routes.ts
import { Router } from "express";
import {
  updateGrades,
  getGradesBystudentCode,
  addActivity,
  getGradesByCourseId,
  getPassedSubjects,
  getGeneralAverageController,
  createGradeByIds ,
  deleteGradesController ,
} from "../controller/addGradesController";

const router = Router();

/**
 * Actualiza una nota específica y recalcula cortes/curso
 * PUT /api/grade/update
 */
router.put("/update", updateGrades);

/**
 * Obtiene las notas de un estudiante por studentCode
 * GET /api/grade/student/:studentCode
 */
router.get("/student/:studentCode", getGradesBystudentCode);

/**
 * Obtiene todas las notas de un curso
 * GET /api/grade/course/:courseId
 */
router.get("/course/:courseId/:subjectId", getGradesByCourseId);

/**
 * Añade una actividad a todos los estudiantes del curso
 * POST /api/grade/activity
 */
router.post("/activity", addActivity);


router.get("/passed/:studentCode", getPassedSubjects);
router.get("/average/:studentCode", getGeneralAverageController);

/**
 * Crea una nota inicial por IDs
 * POST /api/grade/create
 */
router.post("/create", createGradeByIds);

router.delete("/delete-grade", deleteGradesController);

export default router;
