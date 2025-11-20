/****************************************************
 * IMPORTS
 ****************************************************/
import { StudentGrades } from "../schema/studentGradesSchema";

/****************************************************
 * CONSULTAS
 ****************************************************/
export const searchGrade = (
  studentCode?: string,
  subjectId?: string,
  courseId?: string
) => {
  const query: any = {};

  if (studentCode?.trim()) query.studentCode = studentCode;
  if (subjectId?.trim()) query.subjectId = subjectId;
  if (courseId?.trim()) query.courseId = courseId;

  return StudentGrades.find(query);
};

/****************************************************
 * CÁLCULOS
 ****************************************************/
export const calculateFinalGrade = (
  notas: Array<{ value: number; criteria: number }>
) => {
  if (!notas || notas.length === 0) return 0;

  const totalCriteria = notas.reduce((sum, n) => sum + n.criteria, 0);
  if (totalCriteria > 1) {
    console.warn(
      `La suma de criterios es ${totalCriteria}, debería ser ≤ 1`
    );
  }

  return notas.reduce((sum, n) => sum + n.value * n.criteria, 0);
};

export const calculateFinalCourseGrade = (
  cortes: Array<{ notaFinalCorte: number; criteria?: number }>
) => {
  if (!cortes || cortes.length === 0) return 0;

  const totalCriteria = cortes.reduce((sum, c) => sum + (c.criteria ?? 0), 0);
  if (totalCriteria > 1) {
    console.warn(
      `La suma de ponderaciones de cortes es ${totalCriteria}, debería ser ≤ 1`
    );
  }

  return cortes.reduce(
    (sum, c) => sum + (c.notaFinalCorte ?? 0) * (c.criteria ?? 0),
    0
  );
};

/****************************************************
 * UPDATE DE NOTAS (valor de actividad)
 ****************************************************/
export const updateGrade = async (
  studentCode: string,
  subjectId: string,
  courseId: string,
  corte: number,
  nombreNota: string,
  nuevoValor: number
) => {
  const filter = {
    studentCode,
    subjectId,
    courseId,
    "cortes.corte": corte,
  };

  const student = await StudentGrades.findOne(filter);
  if (!student) return null;

  const corteObj = student.cortes.find((c: any) => c.corte === corte);
  if (!corteObj) return null;

  const notaObj = corteObj.notas.find((n: any) => n.name === nombreNota);
  if (!notaObj) return null;

  const oldValue = notaObj.value;
  if (oldValue === nuevoValor) return student;

  // Aplicar cambio
  notaObj.value = nuevoValor;

  // Recalcular corte y final
  corteObj.notaFinalCorte = calculateFinalGrade(corteObj.notas);
  student.finalGrade = calculateFinalCourseGrade(student.cortes);

  console.log(
    `[updateGrade] student=${student.studentCode} subject=${subjectId} course=${courseId} corte=${corte} nota=${nombreNota} old=${oldValue} new=${nuevoValor}`
  );
  console.log(
    `[updateGrade] Recalculated notaFinalCorte=${corteObj.notaFinalCorte} finalGrade=${student.finalGrade}`
  );

  // Guardar
  const updated = await StudentGrades.findOneAndUpdate(
    { _id: student._id },
    {
      $set: {
        cortes: student.cortes,
        finalGrade: student.finalGrade,
      },
    },
    { new: true }
  );

  return updated;
};

/****************************************************
 * AÑADIR ACTIVIDAD A TODOS LOS ESTUDIANTES
 ****************************************************/
export const addActivityToAllStudents = async (
  courseId: string,
  subjectId: string,
  corte: number,
  nuevaActividad: { name: string; criteria: number }
) => {
  return await StudentGrades.updateMany(
    {
      courseId,
      subjectId,
      "cortes.corte": corte,
    },
    {
      $addToSet: {
        "cortes.$.notas": {
          ...nuevaActividad,
          value: 0,
          autoAdded: true,
        },
      },
    }
  );
};

/****************************************************
 * UPDATE DE CRITERIOS POR NOMBRE (criteria)
 ****************************************************/
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
    courseId,
    "cortes.notas.name": nombreNota,
  }).exec();

  const results = {
    updatedCount: 0,
    updatedStudents: [] as string[],
    errors: [] as Array<{ studentCode: string; message: string }>,
  };

  for (const student of students) {
    try {
      let changed = false;

      for (const corteObj of student.cortes) {
        const matchingNotas = (corteObj.notas || []).filter(
          (n: any) => n.name === nombreNota
        );

        if (!matchingNotas.length) continue;

        for (const nota of matchingNotas) {
          const oldCriteria = nota.criteria ?? 0;

          if (oldCriteria === nuevaCriteria) continue;

          nota.criteria = nuevaCriteria;
          changed = true;
        }

        // Validación: suma no debe pasar de 1
        const sumaNotas = corteObj.notas.reduce(
          (s: number, n: any) => s + (n.criteria ?? 0),
          0
        );
        if (sumaNotas > 1 + Number.EPSILON) {
          results.errors.push({
            studentCode: student.studentCode,
            message: `Suma criteria corte ${corteObj.corte} = ${sumaNotas}, excede 1`,
          });
          changed = false;
          break;
        }

        // Recalcular corte
        corteObj.notaFinalCorte = calculateFinalGrade(corteObj.notas);
      }

      if (!changed) continue;

      // Validación criterios de cortes
      const sumaCortes = student.cortes.reduce(
        (s: number, c: any) => s + (c.criteria ?? 0),
        0
      );
      if (sumaCortes > 1 + Number.EPSILON) {
        results.errors.push({
          studentCode: student.studentCode,
          message: `Suma criterios de cortes = ${sumaCortes}, excede 1`,
        });
        continue;
      }

      // Recalcular final grade
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
/****************************************************
 * CONTAR MATERIAS GANADAS POR UN ESTUDIANTE
 ****************************************************/
export const countPassedSubjects = async (studentCode: string) => {
  if (!studentCode?.trim()) throw new Error("studentCode requerido");

  // Buscar todas las materias del estudiante
  const materias = await StudentGrades.find({ studentCode });

  if (!materias.length) return { passed: 0, total: 0 };

  const passed = materias.filter((m: any) => (m.finalGrade ?? 0) >= 3.0).length;

  return {
    studentCode,
    passed,
    total: materias.length,
  };
};
/****************************************************
 * OBTENER PROMEDIO GENERAL DEL ESTUDIANTE
 ****************************************************/
export const getGeneralAverage = async (studentCode: string) => {
  if (!studentCode?.trim()) throw new Error("studentCode requerido");

  const materias = await StudentGrades.find({ studentCode });

  if (!materias.length) return { studentCode, generalAverage: 0 };

  const sum = materias.reduce(
    (acc: number, m: any) => acc + (m.finalGrade ?? 0),
    0
  );

  const generalAverage = sum / materias.length;

  return {
    studentCode,
    generalAverage: Number(generalAverage.toFixed(2)),
    totalSubjects: materias.length,
  };
};
