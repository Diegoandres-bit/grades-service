import { StudentGrades } from "../schema/studentGradesSchema";
import {
  calculateFinalGrade,
  calculateFinalCourseGrade,
} from "./GradesRepository";

/**
 * updateCriteria:
 * - Actualiza la criteria de una nota (por nombre) en todos los estudiantes filtrados por courseId/subjectId/corte.
 * - Valida que la suma de criterios de notas dentro del corte no supere 1.
 * - Valida que la suma de criterios de cortes no supere 1.
 * - Recalcula notaFinalCorte y finalGrade y persiste el documento actualizado.
 * - Agrega logs claros cuando una criteria cambie y cuando se recalcule.
 *
 * Retorna un objeto con resumen de actualizaciones y errores por estudiante (si aplica).
 */
export const updateCriteria = async (
  courseId: string,
  subjectId: string,
  corte: number,
  nombreNota: string,
  nuevaCriteria: number
) => {
  if (typeof nuevaCriteria !== "number" || nuevaCriteria < 0) {
    throw new Error("nuevaCriteria debe ser número >= 0");
  }

  const query: any = {
    courseId,
    subjectId,
    "cortes.corte": corte,
  };

  const students = await StudentGrades.find(query);

  const results: {
    updatedCount: number;
    updatedStudents: string[];
    errors: Array<{ studentCode: string; message: string }>;
  } = { updatedCount: 0, updatedStudents: [], errors: [] };

  for (const student of students) {
    try {
      const corteObj: any = student.cortes.find((c: any) => c.corte === corte);
      if (!corteObj) {
        results.errors.push({ studentCode: student.studentCode, message: "Corte no encontrado" });
        console.warn(`[updateCriteria] student=${student.studentCode} corte=${corte} not found`);
        continue;
      }

      const notaObj: any = corteObj.notas.find((n: any) => n.name === nombreNota);
      if (!notaObj) {
        results.errors.push({ studentCode: student.studentCode, message: "Nota no encontrada en el corte" });
        console.warn(`[updateCriteria] student=${student.studentCode} nota=${nombreNota} not found`);
        continue;
      }

      const oldCriteria = notaObj.criteria ?? 0;
      if (oldCriteria === nuevaCriteria) {
        console.log(
          `[updateCriteria] student=${student.studentCode} nota=${nombreNota} criteria unchanged (${oldCriteria})`
        );
      } else {
        notaObj.criteria = nuevaCriteria;
        console.log(
          `[updateCriteria] student=${student.studentCode} nota=${nombreNota} criteria changed from ${oldCriteria} to ${nuevaCriteria}`
        );
      }

      const sumNotaCriteria = corteObj.notas.reduce((s: number, n: any) => s + (n.criteria ?? 0), 0);
      if (sumNotaCriteria > 1 + Number.EPSILON) {
        notaObj.criteria = oldCriteria;
        const msg = `Suma de criterios en corte ${corte} es ${sumNotaCriteria}, excede 1`;
        results.errors.push({ studentCode: student.studentCode, message: msg });
        console.error(`[updateCriteria] ${msg} -- student=${student.studentCode}`);
        continue;
      }

      const oldNotaFinal = corteObj.notaFinalCorte ?? 0;
      corteObj.notaFinalCorte = calculateFinalGrade(corteObj.notas);
      console.log(
        `[updateCriteria] student=${student.studentCode} corte=${corte} notaFinalCorte recalculated from ${oldNotaFinal} to ${corteObj.notaFinalCorte}`
      );

      const sumCortesCriteria = student.cortes.reduce((s: number, c: any) => s + (c.criteria ?? 0), 0);
      if (sumCortesCriteria > 1 + Number.EPSILON) {
        notaObj.criteria = oldCriteria;
        corteObj.notaFinalCorte = oldNotaFinal;
        const msg = `Suma de criterios de cortes es ${sumCortesCriteria}, excede 1`;
        results.errors.push({ studentCode: student.studentCode, message: msg });
        console.error(`[updateCriteria] ${msg} -- student=${student.studentCode}`);
        continue;
      }

      const oldFinalGrade = student.finalGrade ?? 0;
      student.finalGrade = calculateFinalCourseGrade(student.cortes);
      console.log(
        `[updateCriteria] student=${student.studentCode} finalGrade recalculated from ${oldFinalGrade} to ${student.finalGrade}`
      );

      student.markModified("cortes");
      student.markModified("finalGrade");
      await student.save();

      results.updatedCount += 1;
      results.updatedStudents.push(student.studentCode);
    } catch (err: any) {
      console.error(`[updateCriteria] Error updating student=${(student as any).studentCode}`, err);
      results.errors.push({ studentCode: (student as any).studentCode || "unknown", message: err.message || String(err) });
    }
  }

  return results;
};