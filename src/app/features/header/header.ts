import { Component, OnInit } from '@angular/core';
import { Mes, PatrimonyService } from '../../core/services/patrimony.service';
import { CommonModule, CurrencyPipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [CommonModule, UpperCasePipe, CurrencyPipe],
  standalone: true,
})
export class HeaderComponent implements OnInit {
  patrimonioTotal = 0;
  progreso = 0;
  mesActual!: Mes;

  constructor(private patrimonyService: PatrimonyService) {}

  ngOnInit() {
    this.patrimonyService.mesActual$.subscribe((mes) => {
      this.mesActual = mes;
      this.patrimonioTotal = this.patrimonyService.calcularPatrimonioTotal(mes);
      this.progreso = Math.min((this.patrimonioTotal / 80000) * 100, 100);
    });
  }
}
