import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.html',
  styleUrls: ['./chart.css'],
  standalone: true,
  imports: [BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  @Input() datasets: ChartConfiguration<'bar'>['data']['datasets'] = [];
  @Input() labels: string[] = [];
  @Input() chartType: ChartType = 'bar';
  @Input() options: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };
}
