import { Component, computed, inject, OnInit } from '@angular/core';
import { PatrimonyService } from '../../core/services/patrimony.service';
import { CommonModule, CurrencyPipe, UpperCasePipe } from '@angular/common';
import { MESES } from '../../core/interfaces/datos.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [CommonModule, UpperCasePipe, CurrencyPipe],
  standalone: true,
})
export class HeaderComponent {
  private patrimonyService = inject(PatrimonyService);

  mesActual = this.patrimonyService.mesActual;

  patrimonioMensual = this.patrimonyService.patrimonioMensual;

  progreso = computed(() => Math.min((this.patrimonioMensual() / 80000) * 100, 100));
}
