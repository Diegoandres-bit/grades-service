import { Corte } from './corte';
export class Materia {
  nombre: string;
  cortes: Corte[];
  nota_final_materia: number;

  constructor(data: any) {
    this.nombre = data.nombre;
    this.cortes = data.cortes.map((c: any) => new Corte(c));
    this.nota_final_materia = data.nota_final_materia ?? 0;
  }
}
