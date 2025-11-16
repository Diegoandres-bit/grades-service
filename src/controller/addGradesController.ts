import { Request, Response } from "express";
import { addGrade, searchGrade } from "../repository/GradesRepository";

export const getGradesBystudentCode = async (req: Request, res: Response) => {
  try {
    const { studentCode } = req.params;

    if (!studentCode) {
      return res.status(400).json({ message: "studentCode es requerido" });
    }

    const grades = await searchGrade(studentCode);

    if (!grades || grades.length === 0) {
      return res.status(404).json({ message: "Grades not found for the given student ID" });
    }

    res.status(200).json({
      message: "Grades retrieved successfully",
      data: grades,
    });
  } catch (error) {
    console.error("Error retrieving grades:", error);
    res.status(500).json({ message: "Error retrieving grades", error });
  }
};



export const addGrades = async (req: Request, res: Response) => {
  try {
    const { studentCode, subjectId, courseId, corte, nuevaNota } = req.body;

const updated = await addGrade(studentCode, subjectId, courseId, corte, nuevaNota);


    if (!updated) {
      return res.status(404).json({ message: "Registro de notas no encontrado" });
    }

    return res.json({
      message: "Nota añadida correctamente",
      data: updated,
    });

  } catch (error) {
    console.error("Error adding grade:", error);
    return res.status(500).json({ message: "Error al añadir nota", error });
  }
};
