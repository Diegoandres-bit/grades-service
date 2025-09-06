import { Request, Response } from 'express';

export const getGradesStudent = (req: Request, res: Response) => {
    const data=([
    { id: 1, teacher: 'Diego', finalgrade: 95, subject: 'Math', assessment_criteria: 2 },
    { id: 2, teacher: 'Valentina', finalgrade: 88, subject: 'Science', assessment_criteria: 6 },
    { id: 3, teacher: 'Juancho', finalgrade: 76, subject: 'History', assessment_criteria: 5 }
  ])
  res.json(data);
};

export const getNotasMateriaEstudianteById = (req: Request, res: Response) => {
  const id = parseInt(req.params.id ?? "", 10);

  const notas = [
    { id: 1, teacher: 'Diego', finalgrade: 95, subject: 'Math', assessment_criteria: 2 },
    { id: 2, teacher: 'Valentina', finalgrade: 88, subject: 'Science', assessment_criteria: 6 },
    { id: 3, teacher: 'Juancho', finalgrade: 76, subject: 'History', assessment_criteria: 5 }
  ];

  const nota = notas.find(n => n.id === id);

  if (!nota) {
    return res.status(404).json({ message: `No se encontró nota con id ${id}` });
  }

  return res.json(nota);
};
