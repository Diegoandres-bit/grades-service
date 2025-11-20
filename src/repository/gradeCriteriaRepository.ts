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
    "cortes.notas.name": nombreNota,
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

      for (const corteObj of student.cortes) {
        const matchingNotas = (corteObj.notas || []).filter(
          (n: any) => n.name === nombreNota
        );

        if (!matchingNotas.length) continue;

        // Aplicar nuevo criteria
        for (const notaObj of matchingNotas) {
          const oldCriteria = notaObj.criteria ?? 0;
          if (oldCriteria !== nuevaCriteria) {
            notaObj.criteria = nuevaCriteria;
            console.log(
              `[updateCriteriaByName] Student ${student.studentCode} | Corte ${corteObj.corte} | Nota '${nombreNota}' -> criteria ${oldCriteria} → ${nuevaCriteria}`
            );
            changedForStudent = true;
          }
        }

        // Validar suma de criteria de notas <= 1
        const sumNotaCriteria = corteObj.notas.reduce(
          (sum: number, n: any) => sum + (n.criteria ?? 0),
          0
        );

        if (sumNotaCriteria > 1 + Number.EPSILON) {
          const msg = `La suma de criteria en corte ${corteObj.corte} es ${sumNotaCriteria.toFixed(
            3
          )} (máx 1)`;
          console.error(
            `[updateCriteriaByName] ERROR | Student ${student.studentCode} | ${msg}`
          );
          results.errors.push({
            studentCode: student.studentCode,
            message: msg,
          });
          changedForStudent = false;
          break;
        }

        // Recalcular nota final del corte
        const oldNotaFinal = corteObj.notaFinalCorte ?? 0;
        corteObj.notaFinalCorte = calculateFinalGrade(corteObj.notas);

        console.log(
          `[updateCriteriaByName] Student ${student.studentCode} | Corte ${corteObj.corte} | notaFinalCorte ${oldNotaFinal} → ${corteObj.notaFinalCorte}`
        );
      }

      if (!changedForStudent) continue;

      // Validar criteria de cortes <= 1
      const sumCortesCriteria = student.cortes.reduce(
        (sum: number, c: any) => sum + (c.criteria ?? 0),
        0
      );

      if (sumCortesCriteria > 1 + Number.EPSILON) {
        const msg = `La suma de criteria de cortes es ${sumCortesCriteria.toFixed(
          3
        )} (máx 1)`;
        console.error(
          `[updateCriteriaByName] ERROR | Student ${student.studentCode} | ${msg}`
        );
        results.errors.push({
          studentCode: student.studentCode,
          message: msg,
        });
        continue;
      }

      // Recalcular nota final del curso
      const oldFinal = student.finalGrade ?? 0;
      student.finalGrade = calculateFinalCourseGrade(student.cortes);

      console.log(
        `[updateCriteriaByName] Student ${student.studentCode} | finalGrade ${oldFinal} → ${student.finalGrade}`
      );

      student.markModified("cortes");
      student.markModified("finalGrade");
      await student.save();

      results.updatedCount++;
      results.updatedStudents.push(student.studentCode);
    } catch (error: any) {
      console.error(
        `[updateCriteriaByName] ERROR | Student ${student.studentCode}`,
        error
      );
      results.errors.push({
        studentCode: student.studentCode,
        message: error.message || String(error),
      });
    }
  }

  return results;
};

