import { Component, HostListener, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
// import { ChartConfiguration, ChartOptions } from "chart.js";

@Component({
  selector: 'app-console',
  templateUrl: './console.page.html',
  styleUrls: ['./console.page.scss'],
})
export class ConsolePage implements OnInit {

  isDesktop: boolean = true;
  runningOrderCount: number = 12;
  orderRequestCount: number = 23;
  totalRevenue: number = 2200;
  selectedPeriod: string = 'daily';
  chartData!: ChartConfiguration<'line'>['data'];
  chartOptions!: ChartOptions<'line'>;

  dailyData = {
    labels: ['10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM'],
    datasets: [
      {
        label: 'Total Revenue',
        data: [300, 400, 500, 350, 600, 900, 700],
        borderColor: '#FF8B43',
        backgroundColor: 'rgba(255, 139, 67, 0.2)',
        fill: true,
      }
    ]
  };

  weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Total Revenue',
        data: [1500, 2000, 1800, 2200, 3000, 2500, 2700],
        borderColor: '#FF8B43',
        backgroundColor: 'rgba(255, 139, 67, 0.2)',
        fill: true,
      }
    ]
  };

  monthlyData = {
    labels: ['Week1', 'Week2', 'Week3', 'Week4'],
    datasets: [
      {
        label: 'Total Revenue',
        data: [6000, 7000, 8000, 7500],
        borderColor: '#FF8B43',
        backgroundColor: 'rgba(255, 139, 67, 0.2)',
        fill: true,
      }
    ]
  };

  quarterlyData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Total Revenue',
        data: [20000, 25000, 22000, 28000],
        borderColor: '#FF8B43',
        backgroundColor: 'rgba(255, 139, 67, 0.2)',
        fill: true,
      }
    ]
  };

  yearlyData = {
    labels: ['2019', '2020', '2021', '2022', '2023'],
    datasets: [
      {
        label: 'Total Revenue',
        data: [80000, 90000, 75000, 100000, 120000],
        borderColor: '#FF8B43',
        backgroundColor: 'rgba(255, 139, 67, 0.2)',
        fill: true,
      }
    ]
  };

  constructor() { }

  ngOnInit() {
    this.checkScreenSize();
    this.initializeChart();
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
  }

  initializeChart(): void {
    this.chartData = this.dailyData;
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Revenue'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time'
          }
        }
      }
    };
  }

    // Handler for period changes
    onPeriodChange(event: any) {
      // Optionally read from 'event.detail.value'
      // or just rely on 'this.selectedPeriod'
      // Call API for data
      switch (this.selectedPeriod) {
        case 'daily':
          this.chartData = this.dailyData;
          break;
        case 'weekly':
          this.chartData = this.weeklyData;
          break;
        case 'monthly':
          this.chartData = this.monthlyData;
          break;
        case 'quarterly':
          this.chartData = this.quarterlyData;
          break;
        case 'yearly':
          this.chartData = this.yearlyData;
          break;
        default:
          this.chartData = this.dailyData;
          break;
      }
    }


  
}


// this.yourDataService.getRevenue(this.selectedPeriod).subscribe((response) => {
//   // Transform response into Chart.js-friendly format
//   this.chartData = {
//     labels: response.labels,
//     datasets: [
//       {
//         label: 'Total Revenue',
//         data: response.values,
//         // ...
//       }
//     ]
//   };
// });