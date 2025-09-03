export type Mes =
  | 'enero'
  | 'febrero'
  | 'marzo'
  | 'abril'
  | 'mayo'
  | 'junio'
  | 'julio'
  | 'agosto'
  | 'septiembre'
  | 'octubre'
  | 'noviembre'
  | 'diciembre';

export interface DatosMes {
  ingresos: number;
  gastos: number;
  sabadell: number;
  myInvestor: number;
  tradeRepublic: number;
  crypto: number;
  invisible: number;
}
export const MESES: Mes[] = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
