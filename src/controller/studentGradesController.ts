import { Request, Response } from "express";
import { StudentGrades } from "../schema/studentGradesSchema";

export const getGradesFromSubjectStudent = async (req: Request, res: Response) => {
  const studentCode = req.query.studentCode as string;

  if (!studentCode) {
    return res.status(400).json({ message: "studentCode es requerido" });
  }

  try {
    const student = await StudentGrades.findOne({ codigoEstudiante: studentCode });
res.json(student);
    if (!student) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las notas", error });
  }
};

                                                                                                                                                                                                                                                                                                                                           
export const finalGrade=(req:Request,res:Response)=> {
    const finalGrade=([{finalGrade:88}])
    res.json (finalGrade)
}


