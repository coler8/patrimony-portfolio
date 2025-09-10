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
  fondosIndexados: number;
  tradeRepublic: number;
  crypto: number;
  zen: number;
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

export type ExchangeKey = 'binance' | 'bitget' | 'simplefx' | 'coinbase' | 'quantfury';

export interface Campo {
  key: keyof DatosMes; // 👈 asegura que siempre es una propiedad de DatosMes
  label: string;
}

export interface FieldGroups {
  title: string;
  fields: Campo[];
  targetPercentage: number;
}
