import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { PAYMENT_METHODS } from 'src/app/enums/enum';
import { cartDataModel, OrderDataModal } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';
import { AddressExtractionService } from 'src/app/services/util/address-extraction.service';
import { CartNotificationService } from 'src/app/services/util/cart-notification.service';
import { DeliveryTimeCalculationService } from 'src/app/services/util/delivery-time-calculation.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {

  paymentDone: boolean = false;
  discountLogo: string = 'assets/icons/discount-green.png'
  isDesktop: boolean = true;
  addressFormGroup!: FormGroup;
  selectedAddress: string = '';
  selectedAddressData: any = {};
  deliveryTimeEstimation: number = 0;
  user: any = {};
  rawCartData: any = [];
  cartDetails: cartDataModel[] = [];
  dealInformation: any = [];
  discountAmount: number = 0;
  totalAmount: number = 0;
  itemCount: number = 0;
  billDetails: any[] = [
    { label: 'Item Total', amount: 0 },
    { label: 'Delivery Fee', amount: 0 },
    { label: 'Platform Fee', amount: 0 },
    { label: 'GST and Restaurant Charges', amount: 0 },
  ]
  canAbleToDeliver: boolean = true;
  cookingInstructions: string = '';
  selectedPaymentMethod: 'GOOGLE_PAY' | 'STRIPE' | 'POD' | null = null;
  isCashDeliverySelected: boolean = false;
  orderId: string = '';


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private notificationService: NotificationService,
    private cartNotificationService: CartNotificationService,
    private addressExtractionService: AddressExtractionService,
    private deliveryTimeCalculationService: DeliveryTimeCalculationService,
  ) { }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
  }


  async ngOnInit() {
    this.checkScreenSize();
    this.initializeForms();
    if(this.isDesktop){
      this.resetState();
      await this.populateData();
      this.fetchSelectedAddress();
    }
  }

  async ionViewWillEnter() {
    this.resetState();
    await this.populateData();
    this.fetchSelectedAddress();
  }

  resetState() {
    this.cartDetails = [];
    this.rawCartData = [];
    this.totalAmount = 0;
    this.discountAmount = 0;
    this.dealInformation = [];
    this.itemCount = 0;
    this.isCashDeliverySelected = false;
    this.paymentDone = false;
    this.orderId = '';
  }

  initializeForms() {
    this.addressFormGroup = this.fb.group({
      address: ['', Validators.required]
    });
  }

  fetchSelectedAddress() {
    const addresses = this.addressExtractionService.getAddresses();
    if(addresses.length > 0){
      this.selectedAddressData = addresses[0];
      this.selectedAddress = addresses[0].details
    }
  }

  async populateData() {
    this.user.userId = this.authService.getUserId();
    await this.getUserDetails();
    await this.getUserCartData();
  }

  async getUserCartData() {
    this.apiService.getUserCartData(this.user.userId).subscribe(
      async (data: any) => {
        if(data){
          this.rawCartData = data.payload;
          this.rawCartData.cartItems.forEach(async(cart: any) => {
            this.cartDetails.push(cart);
            this.deliveryTimeCalculationService
              .calculateDeliveryTime(this.selectedAddressData.details, cart.restaurant.address)
              .subscribe(                                                                                        
                (minutes: number) => {
                  this.deliveryTimeEstimation = minutes;
                },
                (error: any) => {
                  console.error(error);
                  this.canAbleToDeliver = false;
                  this.notificationService.notifyUser("errorSnack", "Delivery not available at this address, please select another one.");
                }
              );
          });
          this.billDetails = this.rawCartData.billDetails;
          this.totalAmount = this.rawCartData.totalAmount;
          this.discountAmount = this.rawCartData.discountedPrice;
          if(this.rawCartData.couponApplied){
            this.apiService.getDealInformation(this.rawCartData.couponApplied).subscribe(
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
          this.cartDetails.forEach((cart: any) => {
            cart.restaurant.orderItem.forEach((items: any) => {
              this.itemCount = this.itemCount + items.quantity;
            }); 
          })
        }
      },
      (error: any) => {
        console.log(error.error.message);
        this.dismissLoader();
        if(error.error.message == "Cart not found"){
          this.router.navigate(['/user-dashboard/home']);
        }
      }
    );
  }

  async getUserDetails() {
    this.apiService.getUserDetails().subscribe(
      (response: any) => {
        this.user.phoneNumber = response.payload.phoneNumber;
      },
      (error: any) => {
        console.log(error.message || "Something went wrong while adding address from user data.");
      }
    );
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

  removeCookingInstruction() {
    this.cookingInstructions = '';
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

  selectPaymentMethod(method: 'GOOGLE_PAY' | 'STRIPE' | 'POD'): void {
    this.selectedPaymentMethod = method;
    if (method === 'POD') {
      this.isCashDeliverySelected = true;
    } else {
      this.isCashDeliverySelected = false;
    }
  }

  onCashDeliverySelected(): void {
    this.isCashDeliverySelected = !this.isCashDeliverySelected;
  }

  proceedWithPayment(): void {
    if (!this.selectedPaymentMethod) {
      this.notificationService.notifyUser('errorSnack', 'Please select a payment method.');
      return;
    }

    switch (this.selectedPaymentMethod) {
      case 'GOOGLE_PAY':
        // Insert your Google Pay processing logic here
        console.log('Processing Google Pay...');
        break;
      case 'STRIPE':
        // Insert your Stripe processing logic here
        console.log('Processing Stripe payment...');
        break;
      case 'POD':
        let PaymentId = '';
        if(this.isCashDeliverySelected){
          PaymentId = PAYMENT_METHODS.COD
        }
        this.orderProcessing(this.selectedPaymentMethod, PaymentId);
        break;
      default:
        break;
    }
  }

  async orderProcessing(paymentMethod: string, paymentId: string) {

    await this.presentLoader('Processing Payment...');

    const orderDetails: OrderDataModal = {
      userId: this.user.userId,
      userAddress: this.selectedAddressData,
      cartData: this.rawCartData,
      totalPrice: this.totalAmount,
      cookingInstructions: this.cookingInstructions,
      paymentMethod: paymentMethod,
      paymentId: paymentId ? paymentId : PAYMENT_METHODS.POD
    }

    try {
      const addNewOrder: any = await firstValueFrom(this.apiService.addNewOrder(orderDetails));
      if (addNewOrder.payload) {
        this.orderId = addNewOrder.payload._id;
        this.paymentDone = true;

        this.cartNotificationService.removeItemFromCart();

      } else {
        this.notificationService.notifyUser("errorSnack", "Order processing failed. No order ID received.");
        console.error("Order processing failed: No order ID received from the server.");
      }   
    } catch (error: any) {
      this.notificationService.notifyUser("errorSnack", error.error.message || "Error adding new order")
      console.error("Error adding new order:", error);
    } finally {
      this.dismissLoader();
    }


    // setTimeout(() => {
    //   this.dismissLoader();
    //   this.paymentDone = true;
    // }, 1500);

  }

}
