import { StudentGrades } from "../schema/studentGradesSchema";

export const searchGrade = (
  studentCode?: string,
  subjectId?: string,
  courseId?: string
) => {
  const query: any = {};

  if (studentCode && studentCode.trim() !== "") query.studentCode = studentCode;
  if (subjectId && subjectId.trim() !== "") query.subjectId = subjectId;
  if (courseId && courseId.trim() !== "") query.courseId = courseId;

  return StudentGrades.find(query);
};


export const addGrade = async (
  studentCode: string,
  subjectId: string,
  courseId: string,
  corte: number,
  nuevaNota: { name: string; criteria: number; value: number }
) => {

  return await StudentGrades.findOneAndUpdate(
    {
      studentCode,
      subjectId,
      courseId,
      "cortes.corte": corte
    },
    {
      $push: {
        "cortes.$.notas": nuevaNota
      }
    },
    { new: true }
  );
};

