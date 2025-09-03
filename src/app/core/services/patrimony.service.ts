import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatosMes, Mes, MESES } from '../interfaces/datos.interface';

@Injectable({ providedIn: 'root' })
export class PatrimonyService {
  private STORAGE_KEY = 'datosPatrimoniales';

  private camposExcluidos: (keyof DatosMes)[] = ['ingresos', 'gastos'];

  datos = signal<Record<Mes, DatosMes>>({} as Record<Mes, DatosMes>);
  mesActual = signal<Mes>(MESES[new Date().getMonth()]);

  constructor(private http: HttpClient) {
    this.cargarDatos();
  }

  private cargarDatos() {
    const datosGuardados = localStorage.getItem(this.STORAGE_KEY);
    if (datosGuardados) {
      this.datos.set(JSON.parse(datosGuardados));
    } else {
      this.http.get<Record<Mes, DatosMes>>('assets/datos-patrimoniales.json').subscribe({
        next: (json) => this.datos.set(json),
      });
    }
  }

  setMesActual(mes: Mes) {
    this.mesActual.set(mes);
  }

  actualizarMes(mes: Mes, nuevosDatos: DatosMes) {
    this.datos.update((d) => ({ ...d, [mes]: nuevosDatos }));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.datos()));
  }

  getDatosMes(mes: Mes) {
    console.log(this.datos());

    return this.datos()[mes] ?? null; // devuelve null si no existe
  }

  private sumarValores(d: DatosMes): number {
    return Object.entries(d)
      .filter(([key]) => !this.camposExcluidos.includes(key as keyof DatosMes))
      .reduce((total, [, value]) => total + ((value as number) ?? 0), 0);
  }

  calcularPatrimonioMensual(mes: Mes): number {
    const d = this.getDatosMes(mes);
    if (!d) return 0;
    return this.sumarValores(d);
  }

  calcularPatrimonioGlobal(): number {
    const allDatos = this.datos();
    return Object.values(allDatos).reduce((total, d) => total + this.sumarValores(d), 0);
  }
}
