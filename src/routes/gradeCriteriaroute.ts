// src/routes/gradeCriteria.routes.ts
import { Router } from "express";
import { updateCriteriaByNoteName } from "../controller/gradeCriteriaController";

const router = Router();

/**
 * Rutas para actualización de criteria
 *
 * PATCH /api/grades/criteria/by-name
 *   - Body: { subjectId, courseId, nombreNota, nuevaCriteria }
 *   - Actualiza el criteria de una nota para todos los cortes donde exista esa nota
 */
router.patch("/by-name", updateCriteriaByNoteName);

export default router;
