import { StudentGrades } from "../schema/studentGradesSchema";

export const searchGrade = (
  studentCode?: string,
  subjectId?: string,
  courseId?: string
) => {
  const query: any = {};

  if (studentCode && studentCode.trim() !== "") query.studentCode = studentCode;
  if (subjectId && subjectId.trim() !== "") query.subjectId = subjectId;
  if (courseId && courseId.trim() !== "") query.courseId = courseId;

  return StudentGrades.find(query);
};


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
  if (!corteObj) return student;

  const notaObj = corteObj.notas.find(n => n.name === nombreNota);
  if (!notaObj) return student;

  notaObj.value = nuevoValor;

  corteObj.notaFinalCorte = calculateFinalGrade(corteObj.notas);
  await student.save();

  return student;
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
      "cortes.corte": corte
    },
    {
      $addToSet: {
        "cortes.$.notas": { ...nuevaActividad, value: 0, autoAdded: true }
      }
    }
  );
  return result;
};


export const calculateFinalGrade = (notas: Array<{ value: number; criteria: number }>) => {
  if (!notas || notas.length === 0) return 0;

  const totalCriteria = notas.reduce((sum, nota) => sum + nota.criteria, 0)*100;

  if (totalCriteria !== 100) {
    console.warn(`La suma total de criterios es ${totalCriteria}, debería ser 100`);
    return 0;
  }

  const weightedSum = notas.reduce((sum, nota) => sum + (nota.value * nota.criteria) / 100, 0)*100;

  return weightedSum;
};

export const calculateOverallFinalGrade = (cortes: Array<{ notaFinalCorte: number; }>) => {
  if (!cortes || cortes.length === 0) return 0;
  const total = cortes.reduce((sum, corte) => sum + corte.notaFinalCorte, 0);
  return total / cortes.length;
};
