import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as L from 'leaflet';
import { firstValueFrom, interval, Subscription, switchMap, take, timer } from 'rxjs';
import { ARRIVAL_UPDATES, CANCEL_DATA, CANCEL_REASONS, HELP_SUPPORT, ORDER_STATUS, ORDER_STEPS } from 'src/app/enums/enum';
import { UpdateOrderModal } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';
import { DeliveryTimeCalculationService } from 'src/app/services/util/delivery-time-calculation.service';

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.page.html',
  styleUrls: ['./track-order.page.scss'],
})
export class TrackOrderPage implements OnInit {

  @ViewChild('map') mapContainer!: ElementRef;
  map!: L.Map;
  mapLoading: boolean = true;
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
    { label: ORDER_STEPS.ORDER_CONFIRMED, completed: false },
    { label: ORDER_STEPS.COOKING_IN_PROGRESS, completed: false },
    { label: ORDER_STEPS.OUT_FOR_DELIVERY, completed: false },
    { label: ORDER_STEPS.ORDER_DELIVERED, completed: false}
  ];
  riderAssigned: boolean = false;
  riderInstructions: string = '';
  arrivingTime = '';
  arrivalStatus = ARRIVAL_UPDATES.ARRIVAL_ON_TIME;
  cancelTimer: number = 60;
  cancelOrderAllowed: boolean = true;
  cancelReasons: string[] = [
    CANCEL_REASONS.CHANGING_MIND,
    CANCEL_REASONS.PROMISED_DELIVERY_PRICE_TOO_HIGH,
    CANCEL_REASONS.FORGOT_TO_APPLY_COUPON,
    CANCEL_REASONS.ORDERED_WRONG_ITEMS_MORE_ITEMS,
  ];
  selectedCancelReason: string = '';
  timerSubscription!: Subscription;
  orderCancelled: boolean = false;
  cancelHeading: string = CANCEL_DATA.CANCEL_DATA_HEADING;
  cancelContent: string = CANCEL_DATA.CANCEL_DATA_CONTENT;
  helpAndSupportContent: string = HELP_SUPPORT.HELP_SUPPORT_CONTENT;
  helpAndSupportHeading: string = HELP_SUPPORT.HELP_SUPPORT_HEADING;
  helpAndSupportDescription: string = HELP_SUPPORT.HELP_SUPPORT_DESCRIPTION;
  helpAndSupportNumber: string = HELP_SUPPORT.HELP_SUPPORT_NUMBER;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private notificationService: NotificationService,
    private deliveryTimeCalculationService: DeliveryTimeCalculationService,
  ) { }

  async ngOnInit() {
    this.checkScreenSize();
    this.route.params.subscribe((params: any) => {
      this.orderId = params['id'];
    });
    
    if(this.isDesktop){
      this.loadOrderData();
    }
  }

  async ionViewWillEnter() {
    if(!this.isDesktop){
      this.loadOrderData();
    }
  }

  resetState() {
    this.selectedCancelReason = '';
    this.orderDetails = {};
    this.orderItemQuantity = 0;
    this.cartData = {
      restaurant: {
        orderItem: []
      },
      _id: String
    };
    this.dealInformation = [];
    this.cancelOrderAllowed = true;
    this.cancelTimer = 60;
    this.orderCancelled = false;
    if(this.timerSubscription){
      this.timerSubscription.unsubscribe();
    }
  }

  private loadOrderData(){
    this.resetState();
    if (this.orderId) {
      this.fetchOrderDetails(this.orderId);
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
          this.calculateArrivalTime();
        } else if(this.orderDetails.status === ORDER_STATUS.CANCELLED){
          this.orderCancelled = true;
          this.cancelOrderAllowed = false;
          this.cancelTimer = 0;
          if(this.timerSubscription){
            this.timerSubscription.unsubscribe();
          }
        } else {
          this.calculateArrivalTime();
          this.cancelOrderAllowed = false;
          this.cancelTimer = 0;
          if(this.timerSubscription){
            this.timerSubscription.unsubscribe();
          }

        }
        this.loadMapWithCoordinates();
        await this.processData();
      }
    } catch(error: any) {
      this.notificationService.notifyUser("errorSnack", error.error.message);
      if(error.error.message == "order not found"){
        this.router.navigate(['/user-dashboard/home']);
      }

    } finally {
      this.dismissLoader();
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

    if(this.map){
      this.map.remove();
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
        this.orderDetails.status = updatedOrderData.payload.status;
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

  async calculateArrivalTime() {

    const userAddress = this.orderDetails?.userAddress?.details;
    let restaurantAddress;

    this.orderDetails.cartData.cartItems.forEach((cart: any) => {
      restaurantAddress = cart.restaurant.address; 
    })

    const now = new Date();
    now.setMinutes(now.getMinutes() + 25);
    this.arrivingTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // if(userAddress && restaurantAddress){
    //   this.deliveryTimeCalculationService
    //   .calculateDeliveryTime(userAddress, restaurantAddress)
    //   .subscribe(
    //     (minutes: number) => {
    //       const deliveryTimeEstimationInMinutes = minutes + 10;
    //       const now = new Date();
    //       now.setMinutes(now.getMinutes() + deliveryTimeEstimationInMinutes);
    //       this.arrivingTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    //     },
    //     (error: any) => {
    //       console.error(error);
    //       this.notificationService.notifyUser("errorSnack", error.error.message);
    //     }
    //   );
    // }
    
  }

  private initializeMap(userCoords: any): void {
    if(this.map){
      this.map.remove();
    }

    this.map = L.map(this.mapContainer.nativeElement).setView([userCoords.lat, userCoords.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.whenReady(() => {
    });
    

  }

  private addMarker(latitude: number, longitude: number, popupText: string) {
    const marker = L.marker([latitude, longitude]).addTo(this.map);
    this.map.setView([latitude, longitude], 50);
    marker.bindPopup(`<b>${popupText}</b>`).openPopup();
  }

  private async loadMapWithCoordinates() {
    this.mapLoading = true;

    const userAddress = this.orderDetails?.userAddress?.details;
    let restaurantAddress = '';

    this.orderDetails.cartData.cartItems.forEach((cart: any) => {
      restaurantAddress = cart.restaurant.address; 
    })
    
    const userCoords: any = await firstValueFrom(this.deliveryTimeCalculationService.getCoords(userAddress));
    const restaurantCoords: any = await firstValueFrom(this.deliveryTimeCalculationService.getCoords(restaurantAddress));

    if (userCoords && restaurantCoords) {
      // Initialize the map
      this.initializeMap(userCoords);
  
      // Mark both the delivery and restaurant locations on the map
      this.addMarker(userCoords.lat, userCoords.lng, "Delivery Location");
      this.addMarker(restaurantCoords.lat, restaurantCoords.lng, "Restaurant Location");
  
      // Fit the map view to show both markers
      const bounds = L.latLngBounds([ 
        [userCoords.lat, userCoords.lng],
        [restaurantCoords.lat, restaurantCoords.lng] 
      ]);
      this.map.fitBounds(bounds);
  
      // Draw a polyline between the restaurant and delivery location
      const routeCoordinates = [
        [restaurantCoords.lat, restaurantCoords.lng],
        [userCoords.lat, userCoords.lng]
      ];
      const polyline = L.polyline(routeCoordinates, { color: 'blue' }).addTo(this.map);  // Add route in theme color
    }
    this.mapLoading = false;
  }

}
