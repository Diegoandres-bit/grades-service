import { StudentGrades } from "../schema/studentGradesSchema";
import {
  calculateFinalGrade,
  calculateFinalCourseGrade,
} from "./GradesRepository";

/**
 * updateCriteriaByName:
 * - Actualiza el "criteria" de una nota según su nombre (nombreNota)
 *   para todos los estudiantes de un subjectId + courseId.
 * - Aplica el cambio a todos los cortes donde exista esa nota.
 * - Valida que la suma de criterios de notas <= 1 en cada corte.
 * - Valida que la suma de criterios de cortes <= 1.
 * - Recalcula notaFinalCorte y finalGrade.
 * - Retorna un resumen con actualizaciones y errores.
 */
export const updateCriteriaByName = async (
  subjectId: string,
  courseId: string,
  nombreNota: string,
  nuevaCriteria: number
) => {
  if (typeof nuevaCriteria !== "number" || nuevaCriteria < 0) {
    throw new Error("nuevaCriteria debe ser número >= 0");
  }

  const students = await StudentGrades.find({
    subjectId,
    courseId
  });

  const results = {
    updatedCount: 0,
    updatedStudents: [] as string[],
    errors: [] as Array<{ studentCode: string; message: string }>,
  };

  for (const student of students) {
    try {
      let changed = false;

      // Asegurar cortes 1 a 3
      const maxCortes = 3;
      for (let c = 1; c <= maxCortes; c++) {
        if (!student.cortes.find((x: any) => x.corte === c)) {
          student.cortes.push({
            corte: c,
            criteria: 0,
            notas: [],
            notaFinalCorte: 0,
          });
          changed = true;
        }
      }

      student.cortes.sort((a: any, b: any) => a.corte - b.corte);

      // --- APLICAR CAMBIO DE CRITERIA ---
      for (const corteObj of student.cortes) {
        const notasTarget = corteObj.notas.filter(
          (n: any) => n.name === nombreNota
        );

        if (!notasTarget.length) continue;

        // Cambiar criteria
        for (const nota of notasTarget) {
          const oldCriteria = nota.criteria ?? 0;
          if (oldCriteria !== nuevaCriteria) {
            nota.criteria = nuevaCriteria;
            changed = true;
          }
        }

        // --- RECALCULAR CRITERIA TOTAL DEL CORTE ---
        corteObj.criteria = corteObj.notas.reduce(
          (s: number, n: any) => s + (n.criteria ?? 0),
          0
        );

        // Validación
        if (corteObj.criteria > 1 + Number.EPSILON) {
          results.errors.push({
            studentCode: student.studentCode,
            message: `La suma de criterios del corte ${corteObj.corte} (${corteObj.criteria}) excede 1`,
          });
          changed = false;
          break;
        }

        // --- RECALCULAR NOTA FINAL DEL CORTE ---
        corteObj.notaFinalCorte = calculateFinalGrade(corteObj.notas);
      }

      if (!changed) continue;

      // --- RECALCULAR CRITERIA TOTAL DEL CURSO ---
      const criteriaCurso = student.cortes.reduce(
        (s: number, c: any) => s + (c.criteria ?? 0),
        0
      );

      if (criteriaCurso > 1 + Number.EPSILON) {
        results.errors.push({
          studentCode: student.studentCode,
          message: `La suma total de criterios del curso = ${criteriaCurso}, excede 1`,
        });
        continue;
      }

      // --- RECALCULAR NOTA FINAL DEL CURSO ---
      student.finalGrade = calculateFinalCourseGrade(student.cortes);

      student.markModified("cortes");
      student.markModified("finalGrade");
      await student.save();

      results.updatedCount++;
      results.updatedStudents.push(student.studentCode);
    } catch (err: any) {
      results.errors.push({
        studentCode: student.studentCode,
        message: err.message,
      });
    }
  }

  return results;
};
