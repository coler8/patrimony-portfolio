// core/services/patrimonio.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DatosMes {
  ingresos: number;
  gastos: number;
  inversion: number;
  liquidez: number;
  fondosIndexados: number;
  fondosMonetarios: number;
  rentaFija: number;
  crypto: number;
  crowdfunding: number;
}

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

@Injectable({ providedIn: 'root' })
export class PatrimonyService {
  private STORAGE_KEY = 'datosPatrimoniales';
  private _datos = new BehaviorSubject<Record<Mes, DatosMes>>({} as any);
  datos$ = this._datos.asObservable();

  private mesActual = new BehaviorSubject<Mes>('julio');
  mesActual$ = this.mesActual.asObservable();

  constructor() {
    this.cargarDatos();
  }

  private cargarDatos() {
    const datosGuardados = localStorage.getItem(this.STORAGE_KEY);
    if (datosGuardados) {
      this._datos.next(JSON.parse(datosGuardados));
    } else {
      this._datos.next(this.datosIniciales());
    }
  }

  guardarDatos() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._datos.value));
  }

  cambiarMes(mes: Mes) {
    this.mesActual.next(mes);
  }

  actualizarMes(mes: Mes, nuevosDatos: DatosMes) {
    const copia = { ...this._datos.value, [mes]: nuevosDatos };
    this._datos.next(copia);
    this.guardarDatos();
  }

  calcularPatrimonioTotal(mes: Mes): number {
    const d = this._datos.value[mes];
    return (
      d.liquidez + d.fondosIndexados + d.fondosMonetarios + d.rentaFija + d.crypto + d.crowdfunding
    );
  }

  private datosIniciales(): Record<Mes, DatosMes> {
    return {
      enero: {
        ingresos: 3800,
        gastos: 1950,
        inversion: 900,
        liquidez: 15000,
        fondosIndexados: 11000,
        fondosMonetarios: 4500,
        rentaFija: 9000,
        crypto: 18000,
        crowdfunding: 800,
      },
      julio: {
        ingresos: 4179.33,
        gastos: 2078.24,
        inversion: 1050,
        liquidez: 18512.15,
        fondosIndexados: 12694.57,
        fondosMonetarios: 5285.57,
        rentaFija: 10289.23,
        crypto: 20704.26,
        crowdfunding: 1029.79,
      },
      // ... el resto de meses igual
    } as Record<Mes, DatosMes>;
  }
}
