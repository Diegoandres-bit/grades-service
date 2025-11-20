import { Request, Response } from "express";
import { updateCriteriaByName } from "../repository/gradeCriteriaRepository";

/**
 * PATCH /api/grades/criteria/by-name
 * Body: { subjectId, courseId, nombreNota, nuevaCriteria }
 */
export const updateCriteriaByNoteName = async (req: Request, res: Response) => {
  try {
    const { subjectId, courseId, nombreNota, nuevaCriteria } = req.body;

    // Validación mínima
    if (!subjectId || !courseId || !nombreNota || typeof nuevaCriteria !== "number") {
      return res.status(400).json({
        message: "Faltan datos: subjectId, courseId, nombreNota, nuevaCriteria (number)",
      });
    }

    const result = await updateCriteriaByName(
      subjectId,
      courseId,
      nombreNota,
      nuevaCriteria
    );

    return res.status(200).json({
      message: "Criteria actualizado correctamente para todas las notas con ese nombre",
      result,
    });
  } catch (error: any) {
    console.error("[updateCriteriaByNoteName] Error:", error);
    return res.status(500).json({
      message: "Error interno al actualizar criteria",
      error: error?.message || error,
    });
  }
};
