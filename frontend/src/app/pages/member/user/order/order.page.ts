import { formatDate } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ORDER_STATUS } from 'src/app/enums/enum';
import { ApiService } from 'src/app/services/api/api.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {

  isDesktop: boolean = true;
  orderId!: any;
  orderDetails: any = {};
  orderItemQuantity: number = 0;
  orderStatus: string = '';
  totalAmount: number = 0;
  formattedDate: any;
  formattedTime: any;
  billDetails: any[] = [
    { label: 'Item Total', amount: 0 },
    { label: 'Delivery Fee', amount: 0 },
    { label: 'Platform Fee', amount: 0 },
    { label: 'GST and Restaurant Charges', amount: 0 },
  ];
  user: any = {};
  selectedAddressData: any = {};
  cartData: any = {
    restaurant: {
      orderItem: []
    },
    _id: String
  };
  cartDetails: any = [];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.checkScreenSize();
    this.route.params.subscribe((params: any) => {
      this.orderId = params['id'];
    });

    if(this.isDesktop){
      if(this.isDesktop){
        if(this.orderId){
          this.resetState();
          this.fetchOrderDetails(this.orderId);
        }
      }
    }
  }

  async ionViewWillEnter() {
    if(!this.isDesktop){
      this.resetState();
      this.fetchOrderDetails(this.orderId);
    }
  }
  
  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
  }

  resetState() {
    this.cartDetails = [];
    this.orderDetails = {};
    this.orderItemQuantity = 0;
    this.orderStatus = '';
    this.cartData = {
      restaurant: {
        orderItem: []
      },
      _id: String
    };
    this.totalAmount = 0;
  }

  async fetchOrderDetails(orderId: string) {
    await this.presentLoader("Gathering Information...");
    try {
      const orderData: any = await firstValueFrom(this.apiService.getOrderDetails(orderId));
      if(orderData){
        this.orderDetails = orderData.payload;
        this.totalAmount = orderData.payload.totalPrice;
        this.selectedAddressData = orderData.payload.userAddress;
        await this.updateOrderStatus(this.orderDetails.status);
        await this.processData();
        await this.formateDateAndTime();
        await this.populateUserInformation();
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

  async updateOrderStatus(orderStatus: string) {
    switch (orderStatus) {
      case ORDER_STATUS.CONFIRMED:
        this.orderStatus = ORDER_STATUS.CONFIRMED;
        break;
      case ORDER_STATUS.CANCELLED:
        this.orderStatus = ORDER_STATUS.CANCELLED;
        break;
      case ORDER_STATUS.COMPLETED:
        this.orderStatus = ORDER_STATUS.COMPLETED
        break;
      default:
        this.orderStatus = ORDER_STATUS.LIVE
        break;
    }
  }

  async processData() {
    try {
      this.orderDetails.cartData.cartItems.forEach((cart: any) => {
        this.cartDetails.push(cart);
      });
      this.billDetails = this.orderDetails.cartData.billDetails;
      this.orderDetails.cartData.cartItems.forEach((cart: any) => {
        this.cartData = cart;
        cart.restaurant.orderItem.forEach((items: any) => {
          this.orderItemQuantity = this.orderItemQuantity + items.quantity;
        }); 
      })

    } catch (error: any){
      console.log("Error: ", error);
    }
  }

  async formateDateAndTime() {
    const dateJSON = new Date(this.orderDetails.orderDate);
    this.formattedDate = formatDate(dateJSON, 'dd MMM yyyy', 'en-US');
    this.formattedTime = formatDate(dateJSON, 'HH:mm', 'en-US');
  }


  getIconForAddressType(type: string | null): string {
    switch (type) {
      case 'home':
        return 'home';
      case 'Home':
        return 'home';
      case 'work':
        return 'work';
      case 'Work':
        return 'work';
      case 'other':
        return 'navigation';
      case 'Other':
        return 'navigation';
      default:
        return 'location_on';
    }
  }

  async populateUserInformation(){
    this.apiService.getUserDetails().subscribe(
      (response: any) => {
        this.user.phoneNumber = response.payload.phoneNumber;
      },
      (error: any) => {
        console.log(error.message || "Something went wrong while adding address from user data.");
      }
    );
  }

  navigateToOrderTracking() {
    this.router.navigate([`/user-dashboard/track-order/${this.orderId}`])
  }
}
