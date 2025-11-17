import { StudentGrades } from "../schema/studentGradesSchema";

// Reutilizamos funciones de cálculo
const calculateFinalGrade = (notas: Array<{ value: number; criteria: number }>) => {
  if (!notas || notas.length === 0) return 0;
  const totalCriteria = notas.reduce((sum, nota) => sum + nota.criteria, 0);
  if (totalCriteria > 1) console.warn(`La suma de criterios es ${totalCriteria}, debería ser ≤ 1`);
  return notas.reduce((sum, nota) => sum + nota.value * nota.criteria, 0);
};

const calculateFinalCourseGrade = (cortes: Array<{ notaFinalCorte: number; criteria?: number }>) => {
  if (!cortes || cortes.length === 0) return 0;
  const totalCriteria = cortes.reduce((sum, c) => sum + (c.criteria ?? 0), 0);
  if (totalCriteria > 1) console.warn(`La suma de ponderaciones de cortes es ${totalCriteria}, debería ser ≤ 1`);
  return cortes.reduce((sum, c) => sum + (c.notaFinalCorte ?? 0) * (c.criteria ?? 0), 0);
};

export const updateCriteria = async (
  courseId: string,
  subjectId: string,
  corte: number,
  nombreNota: string,
  nuevaCriteria: number
) => {
  // Actualizar la criteria de la nota
  const students = await StudentGrades.find({
    courseId,
    subjectId,
    "cortes.corte": corte,
  });

  for (const student of students) {
    const corteObj = student.cortes.find(c => c.corte === corte);
    if (!corteObj) continue;

    const notaObj = corteObj.notas.find(n => n.name === nombreNota);
    if (!notaObj) continue;

    notaObj.criteria = nuevaCriteria;

    // Recalcular nota final del corte
    corteObj.notaFinalCorte = calculateFinalGrade(corteObj.notas);

    // Recalcular nota final del curso
    student.finalGrade = calculateFinalCourseGrade(student.cortes);

    await student.save();
  }

  return { message: "Criterio actualizado y notas recalculadas correctamente" };
};
