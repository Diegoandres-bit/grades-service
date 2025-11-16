import { Request, Response } from "express";
import { updateCriteria } from "../repository/gradeCriteriaRepository";

export const updateCriteriaAllStudents = async (req: Request, res: Response) => {
  try {
    const { courseId, subjectId, corte, nombreNota, nuevaCriteria } = req.body;

    const result = await updateCriteria(
      courseId,
      subjectId,
      corte,
      nombreNota,
      nuevaCriteria
    );

    return res.json({
      message: "Criterio actualizado correctamente en todas las notas",
      result,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error actualizando criteria", error });
  }
};

