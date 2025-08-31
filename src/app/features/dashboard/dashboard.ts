import { Component, inject, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { DatosMes, Mes, PatrimonyService } from '../../core/services/patrimony.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from '../../shared/components/chart/chart';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ChartComponent],
})
export class DashboardComponent implements OnInit {
  private patrimonioService = inject(PatrimonyService);

  mesActual!: Mes;
  datos!: DatosMes;

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

  // --- Charts ---
  evolucionLabels: string[] = [];
  evolucionData: number[] = [];
  distribucionLabels = [
    'Liquidez',
    'Indexados',
    'Monetarios',
    'Renta Fija',
    'Crypto',
    'Crowdfunding',
  ];
  distribucionData: number[] = [];

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#fff' } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#fff' },
        grid: { color: '#333' },
      },
      x: {
        ticks: { color: '#fff' },
        grid: { display: false },
      },
    },
  };

  ngOnInit(): void {
    // suscribirse al mes actual
    this.patrimonioService.mesActual$.subscribe((mes) => {
      this.mesActual = mes;
      this.datos = { ...this.patrimonioService['_datos'].value[mes] }; // clone para editar inputs
      this.actualizarGraficos();
    });

    // inicializar gráfico evolución
    this.evolucionLabels = this.meses.map((m) => m.charAt(0).toUpperCase() + m.slice(1));
  }

  cambiarMes(mes: Mes) {
    this.patrimonioService.cambiarMes(mes);
  }

  actualizarDatos() {
    this.patrimonioService.actualizarMes(this.mesActual, this.datos);
    this.actualizarGraficos();
  }

  private actualizarGraficos() {
    // evolución
    this.evolucionData = this.meses.map((m) => this.patrimonioService.calcularPatrimonioTotal(m));

    // distribución
    const d = this.datos;
    this.distribucionData = [
      d.liquidez,
      d.fondosIndexados,
      d.fondosMonetarios,
      d.rentaFija,
      d.crypto,
      d.crowdfunding,
    ];
  }
}
