import { StudentGrades } from "../schema/studentGradesSchema";

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

export const calculateFinalGrade = (notas: Array<{ value: number; criteria: number }>) => {
  if (!notas || notas.length === 0) return 0;

  const totalCriteria = notas.reduce((sum, n) => sum + n.criteria, 0);
  if (totalCriteria > 1) {
    console.warn(`La suma de criterios es ${totalCriteria}, debería ser ≤ 1`);
  }

  return notas.reduce((sum, n) => sum + n.value * n.criteria, 0);
};

export const calculateFinalCourseGrade = (cortes: Array<{ notaFinalCorte: number; criteria?: number }>) => {
  if (!cortes || cortes.length === 0) return 0;

  const totalCriteria = cortes.reduce((sum, c) => sum + (c.criteria ?? 0), 0);
  if (totalCriteria > 1) {
    console.warn(`La suma de ponderaciones de cortes es ${totalCriteria}, debería ser ≤ 1`);
  }

  return cortes.reduce((sum, c) => sum + (c.notaFinalCorte ?? 0) * (c.criteria ?? 0), 0);
};

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
  if (oldValue === nuevoValor) {
    return student;
  }

  notaObj.value = nuevoValor;

  corteObj.notaFinalCorte = calculateFinalGrade(corteObj.notas);

  student.finalGrade = calculateFinalCourseGrade(student.cortes);

  console.log(
    `[updateGrade] student=${student.studentCode} subject=${subjectId} course=${courseId} corte=${corte} nota=${nombreNota} old=${oldValue} new=${nuevoValor}`
  );
  console.log(
    `[updateGrade] Recalculated notaFinalCorte=${corteObj.notaFinalCorte} finalGrade=${student.finalGrade}`
  );

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