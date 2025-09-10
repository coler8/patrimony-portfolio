import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatosMes, Mes, MESES } from '../interfaces/datos.interface';

@Injectable({ providedIn: 'root' })
export class PatrimonyService {
  private STORAGE_KEY = 'datosPatrimoniales';

  private camposExcluidos: (keyof DatosMes)[] = ['ingresos', 'gastos'];

  datos = signal<Record<Mes, DatosMes>>({} as Record<Mes, DatosMes>);
  mesActual = signal<Mes>(MESES[new Date().getMonth()]);

  patrimonioMensual = computed(() => {
    const mes = this.mesActual();
    const valor = this.calcularPatrimonioMensual(mes);

    if (valor === 0) {
      // Calcular mes anterior
      const indiceMesActual = MESES.indexOf(mes);
      const mesAnterior = indiceMesActual > 0 ? MESES[indiceMesActual - 1] : MESES[11];

      return this.calcularPatrimonioMensual(mesAnterior);
    }

    return valor;
  });

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
}
