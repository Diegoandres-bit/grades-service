export class Nota {
  tipo: string;
  valor: number;
  ponderacion: number;

  constructor(data: any) {
    this.tipo = data.tipo;
    this.valor = data.valor;
    this.ponderacion = data.ponderacion;
  }
}