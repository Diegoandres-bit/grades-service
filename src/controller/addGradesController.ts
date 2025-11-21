import { Request, Response } from "express";
import { updateGrade
  , searchGrade
  , addActivityToAllStudents
  , countPassedSubjects,
  getGeneralAverage, } from "../repository/GradesRepository";

// Obtener notas por studentCode
export const getGradesBystudentCode = async (req: Request, res: Response) => {
  try {
    const { studentCode } = req.params;
    if (!studentCode) return res.status(400).json({ message: "studentCode es requerido" });

    const grades = await searchGrade(studentCode);
    if (!grades || grades.length === 0) return res.status(404).json({ message: "Grades not found" });

    return res.status(200).json({ message: "Grades retrieved successfully", data: grades });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error retrieving grades", error });
  }
};

// Obtener notas por courseId
export const getGradesByCourseId = async (req: Request, res: Response) => {
  try {
    const { courseId,subjectId } = req.params;
    if (!courseId ) return res.status(400).json({ message: "courseId es requerido" });
    if(!subjectId ) return res.status(400).json({ message: "subjectId es requerido" });

    const grades = await searchGrade(undefined, subjectId, courseId);
    return res.status(200).json({ message: "Grades retrieved successfully", data: grades });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error retrieving grades", error });
  }
};

// Actualizar nota y recalcular cortes y curso
export const updateGrades = async (req: Request, res: Response) => {
  try {
    const { studentCode, subjectId, courseId, corte, nombreNota, nuevoValor } = req.body;
    if (!studentCode || !subjectId || !courseId || corte == null || !nombreNota || typeof nuevoValor !== "number") {
      return res.status(400).json({ message: "Faltan datos requeridos o formato incorrecto" });
    }

    const updated = await updateGrade(studentCode, subjectId, courseId, corte, nombreNota, nuevoValor);
    if (!updated) return res.status(404).json({ message: "Registro de notas no encontrado" });

    return res.status(200).json({ message: "Nota actualizada correctamente", data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar nota", error });
  }
};

// Añadir actividad
export const addActivity = async (req: Request, res: Response) => {
  try {
    const { courseId, subjectId, corte, nuevaActividad } = req.body;
    if (!courseId || !subjectId || corte == null || !nuevaActividad?.name || typeof nuevaActividad?.criteria !== 'number') {
      return res.status(400).json({ message: 'Faltan datos obligatorios o formato incorrecto' });
    }

    const result = await addActivityToAllStudents(courseId, subjectId, corte, nuevaActividad);
    return res.status(200).json({ message: 'Actividad añadida a todos los estudiantes correctamente', result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al añadir actividad', error });
  }
};
/**
 * Devuelve cuántas materias ha ganado un estudiante
 * GET /api/grades/stats/passed/:studentCode
 */
export const getPassedSubjects = async (req: Request, res: Response) => {
  try {
    const { studentCode } = req.params;

    const result = await countPassedSubjects(studentCode?.toString() || "");

    return res.status(200).json({
      message: "Materias ganadas obtenidas correctamente",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error obteniendo materias ganadas",
      error: error.message,
    });
  }
};

/**
 * Devuelve el promedio general del estudiante
 * GET /api/grades/stats/average/:studentCode
 */
export const getGeneralAverageController = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentCode } = req.params;

    const result = await getGeneralAverage(studentCode?.toString() || "");

    return res.status(200).json({
      message: "Promedio general obtenido correctamente",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error obteniendo el promedio general",
      error: error.message,
    });
  }
};
