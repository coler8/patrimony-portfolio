import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { PatrimonyService } from '../../core/services/patrimony.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatosMes, Mes } from '../../core/interfaces/datos.interface';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
})
export class DashboardComponent implements OnInit {
  private patrimonioService = inject(PatrimonyService);

  meses: Mes[] = [
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

  // Signals
  mesActual = this.patrimonioService.mesActual;
  datos = signal<DatosMes>({ ...this.patrimonioService.getDatosMes(this.mesActual()) });
  variacionData = signal<number[]>([]);

  variacionDataset = computed(() => [
    {
      data: this.variacionData(),
      backgroundColor: this.variacionData().map((v) => (v >= 0 ? '#32CD32' : '#FF4500')),
      borderRadius: 4,
    },
  ]);

  campos = [
    { label: 'INGRESOS', key: 'ingresos' },
    { label: 'GASTOS', key: 'gastos' },
    { label: ' ', key: 'invisible' },
    { label: 'SABADELL', key: 'sabadell' },
    { label: 'myInvestor', key: 'myInvestor' },
    { label: 'Trade Republic', key: 'tradeRepublic' },
    { label: 'CRYPTO', key: 'crypto' },
  ] as const;

  // Charts
  evolucionLabels = this.meses.map((m) => m.charAt(0).toUpperCase() + m.slice(1));
  evolucionData = signal<number[]>([]);
  distribucionLabels = ['Liquidez', 'myInvestor', 'Trade Republic', 'Crypto'];
  distribucionData = signal<number[]>([]);

  chartEvolucionOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw; // el dato de la barra
            return value + ' €'; // lo muestras con €
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#fff' }, grid: { color: '#333' } },
      x: { ticks: { color: '#fff' }, grid: { display: false } },
    },
  };
  chartDistribucionOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#fff', usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataset = context.dataset.data as number[];
            const total = dataset.reduce((a, b) => a + (b as number), 0);
            const value = context.raw as number;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value}€ (${percentage}%)`;
          },
        },
      },
    },
  };

  chartVariacionOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const sign = value >= 0 ? '+' : '';
            return `${sign}${value} €`;
          },
        },
      },
    },
    scales: {
      y: { ticks: { color: '#fff' }, grid: { color: '#333' } },
      x: { ticks: { color: '#fff' }, grid: { display: false } },
    },
  };

  plugins = [
    {
      id: 'percentLabelsWithLabel',
      afterDraw: (chart: any) => {
        const { ctx, data } = chart;
        const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
        const meta = chart.getDatasetMeta(0);

        ctx.save();
        meta.data.forEach((arc: any, index: number) => {
          const value = data.datasets[0].data[index];
          const label = data.labels[index];
          const percentage = ((value / total) * 100).toFixed(1) + '%';
          const { x, y } = arc.getCenterPoint();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Texto combinado: label + porcentaje
          ctx.fillText(`${label} ${percentage}`, x, y);
        });
        ctx.restore();
      },
    },
  ];

  constructor() {
    // efecto para actualizar datos cuando cambia el mes
    effect(() => {
      const mes = this.mesActual();
      const datosMes = this.patrimonioService.getDatosMes(mes);
      if (datosMes) {
        this.datos.set({ ...datosMes });
        this.actualizarGraficos();
      }
    });

    // efecto para actualizar gráficos automáticamente al cambiar los datos
    effect(() => {
      this.datos(); // lectura reactiva
      this.actualizarGraficos();
    });
  }

  ngOnInit(): void {
    console.log('dash');
  }

  cambiarMes(mes: Mes) {
    this.patrimonioService.setMesActual(mes);
  }

  actualizarDatos() {
    this.patrimonioService.actualizarMes(this.mesActual(), this.datos());
    this.actualizarGraficos();
  }

  private actualizarGraficos() {
    // Evolución
    this.evolucionData.set(
      this.meses.map((m) => this.patrimonioService.calcularPatrimonioMensual(m))
    );

    // Distribución
    const d = this.datos();
    this.distribucionData.set([d.sabadell, d.myInvestor, d.tradeRepublic, d.crypto]);

    this.evolucionData.set(
      this.meses.map((m) => this.patrimonioService.calcularPatrimonioMensual(m))
    );

    this.variacionData.set(this.calcularVariacionMensual());
  }

  private calcularVariacionMensual(): number[] {
    const patrimonios = this.meses.map((m) => this.patrimonioService.calcularPatrimonioMensual(m));

    // Primer mes no tiene comparación, lo ponemos 0
    const variaciones = patrimonios.map((p, i) => (i === 0 ? 0 : p - patrimonios[i - 1]));

    return variaciones;
  }
}
