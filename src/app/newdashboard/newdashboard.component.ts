import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule  } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';




@Component({
  selector: 'app-newdashboard',
  imports: [CommonModule, NgChartsModule ],
  templateUrl: './newdashboard.component.html',
  styleUrl: './newdashboard.component.scss'
})
export class NewdashboardComponent  {
 score = 4.55;
  activeTab = 'Quality';

  barStable = 5;
  barCaution = 15;
  barCritical = 80;

  calendarDays = [
    { label: 'THU', day: 19 },
    { label: 'FRI', day: 20 },
    { label: 'SAT', day: 21 },
    { label: 'SUN', day: 22 },
    { label: 'MON', day: 23, current: true, today: true },
    { label: 'TUE', day: 24 },
    { label: 'WED', day: 25 }
  ];

  // Chart.js line chart configuration
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['THU', 'FRI', 'SAT', 'SUN', 'MON', 'TUE', 'WED'],
    datasets: [
      {
        data: [44, 34, 47, 30, 60, 28, 48],
        label: 'Voltage',
        fill: true,
        tension: 0.45,
        borderColor: '#338bff',
        backgroundColor: 'rgba(51,139,255,0.08)',
        pointBackgroundColor: '#338bff',
        pointRadius: 2
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 2 }
    },
    scales: {
      x: {
        ticks: { color: '#909090', font: { size: 10 } },
        grid: { display: false }
      },
      y: { display: false }
    },
    plugins: {
      legend: { display: false }
    }
  };
  public lineChartLegend = false;
 public lineChartType: 'line' = 'line';

  get gaugeCircumference(): number {
    return 2 * Math.PI * 21;
  }
  get gaugeDashOffset(): number {
    const percent = this.score / 5;
    return this.gaugeCircumference * (1 - percent);
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

}
