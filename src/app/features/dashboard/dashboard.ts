import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { PatrimonyService } from '../../core/services/patrimony.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Campo,
  DatosMes,
  ExchangeKey,
  FieldGroups,
  Mes,
} from '../../core/interfaces/datos.interface';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, DecimalPipe],
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

  patrimonioMensual = this.patrimonioService.patrimonioMensual;

  variacionDataset = computed(() => [
    {
      data: this.variacionData(),
      backgroundColor: this.variacionData().map((v) => (v >= 0 ? '#32CD32' : '#FF4500')),
      borderRadius: 4,
    },
  ]);

  campos = [
    { label: 'INGRESOS ✔', key: 'ingresos' },
    { label: 'GASTOS 💥', key: 'gastos' },
    { label: 'SABADELL', key: 'sabadell' },
    { label: 'myInvestor', key: 'myInvestor' },
    { label: 'Fondos Indexados (MSCI WORLD y EMERGING)', key: 'fondosIndexados' },
    { label: 'Trade Republic', key: 'tradeRepublic' },
    { label: 'Zen', key: 'zen' },
    { label: 'CRYPTO', key: 'crypto' },
  ] as const;

  // Charts
  evolucionLabels = this.meses.map((m) => m.charAt(0).toUpperCase() + m.slice(1));
  evolucionData = signal<number[]>([]);
  distribucionLabels: string[] = [];
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
        labels: {
          usePointStyle: true,
          generateLabels: (chart) => {
            const data = chart.data;
            const dataset = data.datasets[0].data as number[];
            const total = dataset.reduce((a: number, b: number) => a + b, 0);

            return (data.labels ?? []).map((label, i: number) => {
              const value = dataset[i] || 0;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';

              return {
                text: `${label as string}: ${value}€ (${percentage}%)`,
                fillStyle: (data.datasets[0] as any).backgroundColor[i],
                strokeStyle: (data.datasets[0] as any).backgroundColor[i],
                fontColor: '#fff', // 👈 para Chart.js < 4
                font: {
                  // 👈 para Chart.js 4.x+
                  size: 12,
                  family: 'Arial',
                  weight: 'normal',
                  style: 'normal',
                },
                hidden: false,
                index: i,
              };
            });
          },
          color: '#fff', // 👈 fallback si no respeta el font
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataset = context.dataset.data as number[];
            const total = dataset.reduce((a, b) => a + (b as number), 0);
            const value = context.raw as number;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
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

  pluginsDistribucion = [
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

          ctx.fillText(`${label} ${percentage}`, x, y);
        });
        ctx.restore();
      },
    },
    {
      id: 'totalInCenter',
      afterDraw: (chart: any) => {
        const { ctx, chartArea, data } = chart;
        const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);

        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `Total: ${total} €`,
          (chartArea.left + chartArea.right) / 2,
          (chartArea.top + chartArea.bottom) / 2
        );
        ctx.restore();
      },
    },
  ];

  optionsCalculators = ['calculo criptomonedas'] as const;
  calculatorActual = signal<string | null>(null);

  // Total de la calculadora (computed)
  cryptoTotal = computed(() => {
    const c = this.cryptoCalc();
    return c.binance + c.bitget + c.simplefx + c.coinbase + c.quantfury;
  });

  cryptoCampos = [
    { key: 'binance', label: 'Binance' },
    { key: 'bitget', label: 'Bitget' },
    { key: 'simplefx', label: 'SimpleFX' },
    { key: 'coinbase', label: 'Coinbase' },
    { key: 'quantfury', label: 'Quantfury' },
  ] as { key: ExchangeKey; label: string }[];

  cryptoCalc = signal<Record<ExchangeKey, number>>({
    binance: 0,
    bitget: 0,
    simplefx: 0,
    coinbase: 0,
    quantfury: 0,
  });

  fieldGroups: FieldGroups[] = [
    {
      title: 'LIQUIDEZ',
      targetPercentage: 10,
      fields: [
        { key: 'sabadell', label: 'Sabadell' },
        { key: 'zen', label: 'Zen' },
      ],
    },
    {
      title: 'CUENTAS REMUNERADAS',
      targetPercentage: 60,
      fields: [
        { key: 'tradeRepublic', label: 'Trade Republic' },
        { key: 'myInvestor', label: 'MyInvestor' },
      ],
    },
    {
      title: 'INVERSIONES',
      targetPercentage: 30,
      fields: [
        { key: 'fondosIndexados', label: 'Fondos Indexados' },
        { key: 'crypto', label: 'Crypto' },
      ],
    },
    {
      title: 'INGRESOS',
      targetPercentage: 0,
      fields: [
        { key: 'ingresos', label: 'Ingresos' },
        { key: 'gastos', label: 'Gastos' },
      ],
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

  updateCryptoValue(key: ExchangeKey, value: number) {
    this.cryptoCalc.update((c) => ({
      ...c,
      [key]: value,
    }));
  }

  cambiarCalculator(calc: string) {
    this.calculatorActual.update((current) => (current === calc ? null : calc));
  }

  cambiarMes(mes: Mes) {
    this.patrimonioService.setMesActual(mes);
  }

  actualizarDatos() {
    this.patrimonioService.actualizarMes(this.mesActual(), this.datos());
    this.actualizarGraficos();
  }

  calcularTotalGrupo(group: { title: string; fields: Campo[] }): number {
    if (group.title.toLowerCase().includes('ingresos')) {
      const ingresos = this.datos()['ingresos'] ?? 0;
      const gastos = this.datos()['gastos'] ?? 0;
      return ingresos - gastos;
    }

    // Total normal para otros grupos
    return group.fields.reduce((sum, campo) => {
      const value = this.datos()[campo.key] ?? 0;
      return sum + value;
    }, 0);
  }

  calcularPorcentajeGrupo(group: { title: string; fields: Campo[] }): string {
    const totalGrupo = group.fields.reduce((sum, f) => sum + (this.datos()[f.key] ?? 0), 0);
    const patrimonio = this.patrimonioService.calcularPatrimonioMensual(this.mesActual());
    if (patrimonio === 0) return '0';
    const porcentaje = (totalGrupo / patrimonio) * 100;
    return porcentaje.toFixed(1); // un decimal
  }

  private actualizarGraficos() {
    const d = this.datos();

    // Agrupamos myInvestor + Trade Republic
    const cuentaRemunerada = d.myInvestor + d.tradeRepublic;

    // Distribución con label combinado
    this.distribucionLabels = ['Liquidez', 'Cuenta Remunerada', 'Fondos Indexados', 'Crypto'];

    this.distribucionData.set([
      d.sabadell + d.zen, // liquidez total
      cuentaRemunerada, // myInvestor + Trade Republic
      d.fondosIndexados,
      d.crypto,
    ]);

    // Evolución sigue igual
    this.evolucionData.set(
      this.meses.map((m) => this.patrimonioService.calcularPatrimonioMensual(m))
    );

    this.variacionData.set(this.calcularVariacionMensual());
  }

  private calcularVariacionMensual(): number[] {
    const patrimonios = this.meses.map((m) => this.patrimonioService.calcularPatrimonioMensual(m));

    let primerMesConValor = -1;

    return patrimonios.map((p, i) => {
      if (p > 0 && primerMesConValor === -1) {
        // Primer mes con valor → referencia inicial
        primerMesConValor = i;
        return 0;
      }

      if (primerMesConValor !== -1 && p > 0) {
        const prev = patrimonios[i - 1];
        // Solo calculo si el mes anterior también tiene datos
        return prev > 0 ? p - prev : 0;
      }

      // Si aún no hay datos → sin variación
      return 0;
    });
  }
}
