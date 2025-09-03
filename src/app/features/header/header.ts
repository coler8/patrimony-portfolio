import { Component, computed, inject, OnInit } from '@angular/core';
import { PatrimonyService } from '../../core/services/patrimony.service';
import { CommonModule, CurrencyPipe, UpperCasePipe } from '@angular/common';

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

  patrimonioTotal = computed(() => {
    // ✅ ahora devuelve el total acumulado de todos los meses
    return this.patrimonyService.calcularPatrimonioGlobal();
  });

  progreso = computed(() => Math.min((this.patrimonioTotal() / 80000) * 100, 100));
}
