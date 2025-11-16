import { StudentGrades } from "../schema/studentGradesSchema";

export const getGradesStudentByID = (studentCode: string) => {
  return StudentGrades.find({ studentCode });
};
