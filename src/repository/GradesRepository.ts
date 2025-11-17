import { StudentGrades } from "../schema/studentGradesSchema";

// Buscar notas
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

// Calcula la nota final de un corte
export const calculateFinalGrade = (notas: Array<{ value: number; criteria: number }>) => {
  if (!notas || notas.length === 0) return 0;

  const totalCriteria = notas.reduce((sum, n) => sum + n.criteria, 0);
  if (totalCriteria > 1) {
    console.warn(`La suma de criterios es ${totalCriteria}, debería ser ≤ 1`);
  }

  return notas.reduce((sum, n) => sum + n.value * n.criteria, 0);
};

// Calcula la nota final del curso según los cortes
export const calculateFinalCourseGrade = (cortes: Array<{ notaFinalCorte: number; criteria?: number }>) => {
  if (!cortes || cortes.length === 0) return 0;

  const totalCriteria = cortes.reduce((sum, c) => sum + (c.criteria ?? 0), 0);
  if (totalCriteria > 1) {
    console.warn(`La suma de ponderaciones de cortes es ${totalCriteria}, debería ser ≤ 1`);
  }

  return cortes.reduce((sum, c) => sum + (c.notaFinalCorte ?? 0) * (c.criteria ?? 0), 0);
};

// Actualizar una nota
export const updateGrade = async (
  studentCode: string,
  subjectId: string,
  courseId: string,
  corte: number,
  nombreNota: string,
  nuevoValor: number
) => {
  const student = await StudentGrades.findOne({
    studentCode,
    subjectId,
    courseId,
    "cortes.corte": corte,
  });

  if (!student) return null;

  const corteObj = student.cortes.find(c => c.corte === corte);
  if (!corteObj) return null;

  const notaObj = corteObj.notas.find(n => n.name === nombreNota);
  if (!notaObj) return null;

  // Solo actualizamos el valor
  notaObj.value = nuevoValor;

  // Recalculamos la nota final del corte
  corteObj.notaFinalCorte = calculateFinalGrade(corteObj.notas);

  // Recalculamos la nota final del curso
  student.finalGrade = calculateFinalCourseGrade(student.cortes);

  student.markModified("cortes");

  await student.save();
  return student;
};

// Añadir actividad a todos los estudiantes
export const addActivityToAllStudents = async (
  courseId: string,
  subjectId: string,
  corte: number,
  nuevaActividad: { name: string; criteria: number }
) => {
  const result = await StudentGrades.updateMany(
    {
      courseId,
      subjectId,
      "cortes.corte": corte,
    },
    {
      $addToSet: {
        "cortes.$.notas": { ...nuevaActividad, value: 0, autoAdded: true },
      },
    }
  );
  return result;
};
