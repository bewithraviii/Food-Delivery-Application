import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.page.html',
  styleUrls: ['./track-order.page.scss'],
})
export class TrackOrderPage implements OnInit {


  orderId!: any;
  orderDetails: any[] = [];
  currentStepIndex = 2;
  orderSteps: any[] = [
    { label: 'Order Confirmed', completed: true },
    { label: 'Cooking in Progress', completed: true },
    { label: 'Out for Delivery', completed: false },
    { label: 'Order Delivered', completed: false}
  ];
  riderAssigned: boolean = false;
  riderInstructions: string = '';
  arrivingTime = '2:25 PM';
  arrivalStatus = 'On Time';
  cancelTimer: number = 60;
  cancelOrderAllowed: boolean = true;
  timerInterval: any;
  cancelReasons: string[] = [
    'Changing my mind',
    'Promised delivery price too high',
    'Forgot to apply coupon',
    'Ordered wrong items / more items'
  ];
  selectedCancelReason: string = '';


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      this.orderId = params['id'];
    });

    if(this.orderId){
      this.fetchOrderDetails(this.orderId);
    }

    this.startCancelTimer();
  }

  async fetchOrderDetails(orderId: any) {
    // this.apiService.getOrderDetails(orderId).subscribe(
    //   (response: any) => {
    //     this.orderDetails = response.payload;
    //   },
    //   (error: any) => {
    //     console.log(error);
    //   }
    // );
  }

  async navigateToOrder() {
    this.router.navigate([`/user-dashboard/order/${this.orderId}`]);
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  removeRidersInstruction() {
    this.riderInstructions = '';
  }

  startCancelTimer() {
    this.timerInterval = setInterval(() => {
      if (this.cancelTimer > 0) {
        this.cancelTimer--;
      } else {
        this.cancelOrderAllowed = false;
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  onSubmitCancel() {
    if (!this.selectedCancelReason) return;

    console.log('Canceling order with reason:', this.selectedCancelReason);

    clearInterval(this.timerInterval);
    this.cancelOrderAllowed = false;
  }
}
