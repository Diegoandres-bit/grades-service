import { Materia } from './materia';
export class Semestre {
  semestre: string;
  materias: Materia[];

  constructor(data: any) {
    this.semestre = data.semestre;
    this.materias = data.materias.map((m: any) => new Materia(m));
  }
}