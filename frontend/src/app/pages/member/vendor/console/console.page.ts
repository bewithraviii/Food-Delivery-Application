import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartConfiguration, ChartOptions } from 'chart.js';
// import { ChartConfiguration, ChartOptions } from "chart.js";

@Component({
  selector: 'app-console',
  templateUrl: './console.page.html',
  styleUrls: ['./console.page.scss'],
})
export class ConsolePage implements OnInit {

  isDesktop: boolean = true;
  runningOrderCount: number = 0;
  orderRequestCount: number = 0;
  totalRevenue: number = 0;
  selectedPeriod: string = '';
  chartData!: ChartConfiguration<'line'>['data'];
  chartOptions!: ChartOptions<'line'>;
  periods: string[] = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];

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

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    this.checkScreenSize();
    this.initializeChart();
    this.selectedPeriod = 'Daily';
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
  }

  initializeChart(): void {
    this.calculateRevenue(this.dailyData);
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

    const selected = event.value || event.detail?.value;
    if (selected) {
      this.selectedPeriod = selected;
    }

    // Call API for data
    switch (this.selectedPeriod) {
      case 'Weekly':
        this.chartData = this.weeklyData;
        this.calculateRevenue(this.weeklyData);
        break;
      case 'Monthly':
        this.chartData = this.monthlyData;
        this.calculateRevenue(this.monthlyData);
        break;
      case 'Quarterly':
        this.chartData = this.quarterlyData;
        this.calculateRevenue(this.quarterlyData);
        break;
      case 'Yearly':
        this.chartData = this.yearlyData;
        this.calculateRevenue(this.yearlyData);
        break;
      default:
        this.chartData = this.dailyData;
        this.calculateRevenue(this.dailyData);
        break;
    }
  }

  getTabIndex(): number {
    return this.periods.indexOf(this.selectedPeriod);
  }

  onTabIndexChange(index: number): void {
    this.selectedPeriod = this.periods[index];
    // Re-use the chart update logic
    this.onPeriodChange({ value: this.selectedPeriod });
  }
  
  calculateRevenue(dataType: any){
    let amount = 0;
    dataType.datasets[0].data.forEach((value: number) => {
      amount = amount + value;
    });

    this.totalRevenue = amount;
  }

  navigateToReviewManagement() {
    this.router.navigate(['vendor-dashboard/review-management']);
  }

  navigateToRevenueManagement() {
    this.router.navigate(['vendor-dashboard/revenue-management']);
  }

  navigateToOrderRequestManagement() {
    this.router.navigate(['vendor-dashboard/order-request-management']);
  }

  navigateToRunningOrderManagement() {
    this.router.navigate(['vendor-dashboard/running-order-management']);
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