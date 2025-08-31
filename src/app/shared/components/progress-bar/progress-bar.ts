import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-progreso-bar',
  templateUrl: './progress-bar.html',
  styleUrls: ['./progress-bar.css'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  @Input() progreso: number = 0; // entre 0 y 100
  @Input() color: string = '#4caf50'; // color por defecto
  @Input() label?: string;
}
