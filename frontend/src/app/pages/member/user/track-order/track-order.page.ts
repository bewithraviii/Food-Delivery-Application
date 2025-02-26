import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { firstValueFrom, interval, Subscription, take, timer } from 'rxjs';
import { CANCEL_DATA, ORDER_STATUS } from 'src/app/enums/enum';
import { UpdateOrderModal } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.page.html',
  styleUrls: ['./track-order.page.scss'],
})
export class TrackOrderPage implements OnInit {

  isDesktop: boolean = true;
  orderId!: any;
  orderDetails: any = {};
  orderItemQuantity: number = 0;
  totalAmount: number = 0;
  cartData: any = {
    restaurant: {
      orderItem: []
    },
    _id: String
  };
  dealInformation: any = [];
  currentStepIndex = 0;
  orderSteps: {label: string, completed: boolean}[] = [
    { label: 'Order Confirmed', completed: false },
    { label: 'Cooking in Progress', completed: false },
    { label: 'Out for Delivery', completed: false },
    { label: 'Order Delivered', completed: false}
  ];
  riderAssigned: boolean = false;
  riderInstructions: string = '';
  arrivingTime = '2:25 PM';
  arrivalStatus = 'On Time';
  cancelTimer: number = 60;
  cancelOrderAllowed: boolean = true;
  cancelReasons: string[] = [
    'Changing my mind',
    'Promised delivery price too high',
    'Forgot to apply coupon',
    'Ordered wrong items / more items'
  ];
  selectedCancelReason: string = '';
  timerSubscription!: Subscription;
  orderCancelled: boolean = false;
  cancelHeading: string = CANCEL_DATA.CANCEL_DATA_HEADING;
  cancelContent: string = CANCEL_DATA.CANCEL_DATA_CONTENT;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private notificationService: NotificationService,
  ) { }

  async ngOnInit() {
    this.checkScreenSize();
    this.route.params.subscribe((params: any) => {
      this.orderId = params['id'];
    });
    
    if(this.isDesktop){
      if(this.orderId){
        this.resetState()
        this.fetchOrderDetails(this.orderId);
      }
    }
  }

  async ionViewWillEnter() {
    if(!this.isDesktop){
      this.resetState()
      this.fetchOrderDetails(this.orderId);
    }
  }

  resetState() {
    this.selectedCancelReason = '';
    this.orderDetails = {};
    this.cartData = {
      restaurant: {
        orderItem: []
      },
      _id: String
    };
    this.dealInformation = [];
    this.cancelOrderAllowed = true;
    this.cancelTimer = 60;
    if(this.timerSubscription){
      this.timerSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
  }

  async fetchOrderDetails(orderId: any) {
    await this.presentLoader("Gathering Information...");
    try {
      const orderData: any = await firstValueFrom(this.apiService.getOrderDetails(orderId));
      if(orderData){
        this.orderDetails = orderData.payload;
        this.updateOrderSteps(this.orderDetails.status);
        if (this.orderDetails.status === ORDER_STATUS.CONFIRMED) {
          this.cancelOrderAllowed = true;
          this.startCancelTimer();
        } else if(this.orderDetails.status === ORDER_STATUS.CANCELLED){
          this.orderCancelled = true;
          this.cancelOrderAllowed = false;
          this.cancelTimer = 0;
          if(this.timerSubscription){
            this.timerSubscription.unsubscribe();
          }
        } else {
          this.cancelOrderAllowed = false;
          this.cancelTimer = 0;
          if(this.timerSubscription){
            this.timerSubscription.unsubscribe();
          }
        }
        await this.processData();
        this.dismissLoader();
      }
    } catch(error: any) {
      this.notificationService.notifyUser("errorSnack", error.error.message);
      console.log(error);
      this.dismissLoader();
      if(error.error.message == "order not found"){
        this.router.navigate(['/user-dashboard/home']);
      }

    }
  }

  async processData(){
    try {
      this.orderDetails.cartData.cartItems.forEach((cart: any) => {
        this.cartData = cart;
        this.cartData.restaurant.orderItem.forEach((items: any) => {
          this.orderItemQuantity = this.orderItemQuantity + items.quantity;
          let itemTotal =  items.price * items.quantity;
          this.totalAmount = this.totalAmount + itemTotal;
        }); 
      })
      if(this.orderDetails.cartData.couponApplied){
        this.apiService.getDealInformation(this.orderDetails.cartData.couponApplied).subscribe(
          async (response: any) => {
            if(response && response.payload){
              this.dealInformation.push(response.payload);
            }
          },
          (error: any) => {
            console.log(error.error.message);
          }
        );
      }
    } catch (error: any){
      console.log("Error: ", error);
    }
  }

  async navigateToOrder() {
    this.router.navigate([`/user-dashboard/order/${this.orderId}`]);
  }

  async navigateToProfile() {
    this.router.navigate([`/user-dashboard/profile`]);
  }

  async navigateToHome() {
    this.router.navigate([`/user-dashboard/home`]);
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  removeRidersInstruction() {
    this.riderInstructions = '';
  }

  startCancelTimer() {
    const countdown = interval(1000).pipe(take(60));
    this.timerSubscription = countdown.subscribe({
      next: (value: number) => {
        this.cancelTimer = 60 - value;
      },
      complete: () => {
        this.cancelTimer = 0;
        this.cancelOrderAllowed = false;
        this.updateOrderStatus(this.orderId, ORDER_STATUS.PROCESSING);
      }
    });   
  }

  async onSubmitCancel() {
    if (!this.selectedCancelReason) return;

    console.log('Canceling order with reason:', this.selectedCancelReason);
    const cancelledOrder = await this.cancelOrderProcess(this.selectedCancelReason, this.orderId, ORDER_STATUS.CANCELLED);
    if(!cancelledOrder){
      return;
    }

    if(this.timerSubscription)
    {
      this.timerSubscription.unsubscribe();
    }

    this.cancelOrderAllowed = false;
    // this.orderCancelled = true
  }

  async presentLoader(message?: string) {
    const loader = await this.loadingController.create({
      message: message,
      spinner: 'lines',
      backdropDismiss: false,
    });
    await loader.present();
  }
  
  async dismissLoader() {
    await this.loadingController.dismiss();
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  updateOrderSteps(orderStatus: ORDER_STATUS) {
    this.orderSteps.forEach(step => step.completed = false);

    switch (orderStatus) {
      case ORDER_STATUS.PROCESSING:
        this.orderSteps[0].completed = true;
        this.orderSteps[1].completed = true;
        this.currentStepIndex = 1;
        break;
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        this.orderSteps[0].completed = true;
        this.orderSteps[1].completed = true;
        this.orderSteps[2].completed = true;
        this.currentStepIndex = 2;
        break;
      case ORDER_STATUS.COMPLETED:
        this.orderSteps.forEach(step => step.completed = true);
        this.currentStepIndex = 3;
        break;
      default:
        this.orderSteps[0].completed = true;
        this.currentStepIndex = 0;
        break;
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const updateOrderPayload: UpdateOrderModal = {
        userId: this.orderDetails.userId,
        orderId: orderId,
        updateOrderStatusTo: status
      }
      const updatedOrderData: any = await firstValueFrom(this.apiService.updateOrderStatus(updateOrderPayload));
      if(updatedOrderData){
        this.orderDetails = updatedOrderData.payload;
        this.updateOrderSteps(this.orderDetails.status);
      }
    } catch(error: any) {
      this.notificationService.notifyUser("errorSnack", error.error.message);
      console.log(error);
    }
  }

  async cancelOrderProcess(selectedCancelReason: string, orderId: string, status: string ) {
    await this.presentLoader('Cancelling order...');

    try {
      const updateOrderPayload: UpdateOrderModal = {
        userId: this.orderDetails.userId,
        orderId: orderId,
        updateOrderStatusTo: status,
        selectedCancelReason:selectedCancelReason
      }
      const updatedOrderData: any = await firstValueFrom(this.apiService.updateOrderStatus(updateOrderPayload));
      if(updatedOrderData){
        this.orderDetails = updatedOrderData.payload;
        // this.updateOrderSteps(this.orderDetails.status);
      }
      this.dismissLoader();
      return true;
    } catch(error: any) {
      this.dismissLoader();
      this.notificationService.notifyUser("errorSnack", error.error.message);
      console.log(error);
      return false;
    }
  }

}
