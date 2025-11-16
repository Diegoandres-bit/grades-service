import  {Nota} from './Nota';
export class Corte {
  corte: string;
  ponderacion_corte: number;
  notas: Nota[];
  nota_final_corte: number;

  constructor(data: any) {
    this.corte = data.corte;
    this.ponderacion_corte = data.ponderacion_corte;
    this.notas = data.notas.map((n: any) => new Nota(n));
    this.nota_final_corte = data.nota_final_corte ?? 0;
  }
}