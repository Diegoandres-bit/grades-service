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

  const query = {
    subjectId,
    courseId,
  };

  const students = await StudentGrades.find(query).exec();

  const results: {
    updatedCount: number;
    updatedStudents: string[];
    errors: Array<{ studentCode: string; message: string }>;
  } = { updatedCount: 0, updatedStudents: [], errors: [] };

  for (const student of students) {
    try {
      let changedForStudent = false;

      // ⚠️ REGLA NUEVA: asegurar que cada estudiante tenga cortes del 1 al 3
      const maxCortes = 3;
      for (let c = 1; c <= maxCortes; c++) {
        let existing = student.cortes.find((x: any) => x.corte === c);
        if (!existing) {
          console.log(
            `[updateCriteriaByName] Student ${student.studentCode} | Creando corte ${c}`
          );

          student.cortes.push({
            corte: c,
            criteria: 0,
            notas: [],
            notaFinalCorte: 0,
          });
          changedForStudent = true;
        }
      }

      // volver a ordenar cortes (1,2,3)
      student.cortes.sort((a: any, b: any) => a.corte - b.corte);

      // -------------------------------------------------------------------------------------
      // LÓGICA EXISTENTE: aplicar nuevo criteria a las notas con nombre "nombreNota"
      // -------------------------------------------------------------------------------------
      for (const corteObj of student.cortes) {
        const matchingNotas = (corteObj.notas || []).filter(
          (n: any) => n.name === nombreNota
        );

        // si la nota no existe en este corte → continuar
        if (!matchingNotas.length) continue;

        // aplicar nuevo criteria
        for (const notaObj of matchingNotas) {
          const oldCriteria = notaObj.criteria ?? 0;
          if (oldCriteria !== nuevaCriteria) {
            notaObj.criteria = nuevaCriteria;
            changedForStudent = true;
          }
        }

        // validar suma criteria en notas
        const sumNotaCriteria = corteObj.notas.reduce(
          (sum: number, n: any) => sum + (n.criteria ?? 0),
          0
        );

        if (sumNotaCriteria > 1 + Number.EPSILON) {
          results.errors.push({
            studentCode: student.studentCode,
            message: `La suma de criteria en corte ${corteObj.corte} (${sumNotaCriteria.toFixed(
              3
            )}) excede el máximo de 1`,
          });
          changedForStudent = false;
          break;
        }

        // recalcular nota final del corte
        corteObj.notaFinalCorte = calculateFinalGrade(corteObj.notas);
      }

      if (!changedForStudent) continue;

      // Validar suma de criteria de cortes
      const sumCortesCriteria = student.cortes.reduce(
        (sum: number, c: any) => sum + (c.criteria ?? 0),
        0
      );

      if (sumCortesCriteria > 1 + Number.EPSILON) {
        results.errors.push({
          studentCode: student.studentCode,
          message: `La suma de criteria de cortes (${sumCortesCriteria.toFixed(
            3
          )}) excede el máximo de 1`,
        });
        continue;
      }

      // recalcular nota final del curso
      student.finalGrade = calculateFinalCourseGrade(student.cortes);

      student.markModified("cortes");
      student.markModified("finalGrade");
      await student.save();

      results.updatedCount++;
      results.updatedStudents.push(student.studentCode);
    } catch (error: any) {
      results.errors.push({
        studentCode: student.studentCode,
        message: error.message || String(error),
      });
    }
  }

  return results;
};
