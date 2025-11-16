import {Schema,model} from 'mongoose';

const StudentGradesSchema = new Schema(
  {
    studentcode: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },

    cortes: [
      {
        corte: { type: Number, required: true },
        notas: [
          {
            name: { type: String, required: true ,default: ''},
            criteria: { type: Number, required: true, default: 0 },
            value: { type: Number, required: true, default: 0 },
          },
        ],
        notaFinalCorte: { type: Number, default: 0 },
      },
    ],

    finalGradeCriteria: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const StudentGrades = model("studentgrades", StudentGradesSchema);
