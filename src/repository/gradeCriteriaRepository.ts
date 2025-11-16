import { StudentGrades } from "../schema/studentGradesSchema";


export const updateCriteria = async (
  courseId: string,
  subjectId: string,
  corte: number,
  nombreNota: string,
  nuevaCriteria: number
) => {
  await StudentGrades.updateMany(
  {
    courseId,
    subjectId
  },
  {
    $set: {
      "cortes.$[c].notas.$[n].criteria": nuevaCriteria
    }
  },
  {
    arrayFilters: [
      { "c.corte": corte },
      { "n.name": nombreNota }
    ]
  }
);
};
