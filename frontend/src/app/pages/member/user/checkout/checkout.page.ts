import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { cartDataModel } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';
import { AddressExtractionService } from 'src/app/services/util/address-extraction.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {

  discountLogo: string = 'assets/icons/discount-green.png'
  isDesktop: boolean = true;
  addressFormGroup!: FormGroup;
  addresses: any[] = [];
  selectedAddress: string = '';
  selectedAddressData: any = {};
  deliveryTimeEstimation: number = 0;
  user: any;
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
  selectedPaymentMethod: 'googlePay' | 'stripe' | 'pod' | null = null;


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private notificationService: NotificationService,
    private addressExtractionService: AddressExtractionService,
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
    this.addresses = [];
    this.totalAmount = 0;
    this.discountAmount = 0;
    this.dealInformation = [];
    this.itemCount = 0;
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

    this.user = this.authService.getUserId();
    this.apiService.getUserCartData(this.user).subscribe(
      async (data: any) => {
        if(data){
          console.log(data);
          data.payload.cartItems.forEach((cart: any) => {
            this.cartDetails.push(cart);
            this.deliveryTime(this.selectedAddressData.details, this.cartDetails[0]?.restaurant?.address);
          });
          this.billDetails = data.payload.billDetails;
          this.totalAmount = data.payload.totalAmount;
          this.discountAmount = data.payload.discountedPrice;
          if(data.payload.couponApplied){
            this.apiService.getDealInformation(data.payload.couponApplied).subscribe(
              async (data: any) => {
                if(data && data.payload){
                  this.dealInformation.push(data.payload);
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
      }
    );
    this.apiService.getUserDetails().subscribe(
      (data: any) => {
        data.payload.address.forEach((address: any) => {
          this.addresses.push(address);
        });
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

  async deliveryTime(address: string, restaurantAddress: string) {
    await this.calculateTravelTime(address, restaurantAddress);
  }
  
  async calculateTravelTime(destination: string, restaurantAddress: string) {
    let restaurantCoords: any;  
    let destinationCoords: any;

    restaurantCoords = await this.getCoordsOfAddress(restaurantAddress);
    destinationCoords = await this.getCoordsOfAddress(destination);

    if(restaurantCoords && destinationCoords) {
      const start = `${restaurantCoords.lon},${restaurantCoords.lat}`;
      const end = `${destinationCoords.lon},${destinationCoords.lat}`;

      this.apiService.getDistanceTrackTime(start, end).subscribe(
        (response: any) => {
          const travelTimeInSeconds = response.features[0].properties.summary.duration;
          const travelTimeInMinutes = travelTimeInSeconds / 60;
          this.deliveryTimeEstimation = +travelTimeInMinutes.toFixed(0);
        },
        (error: any) => {
          console.log("Here", error.error.error);
          if(error.error.error.code === 2004){
            this.canAbleToDeliver = false;
            this.notificationService.notifyUser("errorSnack", "Delivery not available at this address, Please select other one.");
          }
        }
      );
    }
  }

  async getCoordsOfAddress(address: string): Promise<{ lat: number, lon: number } | null> {
    try {
      const response = await this.apiService.getAddressLatAndLong(address).toPromise();
      if (response && response.features && response.features.length > 0) {
        const coordinates = response.features[0].geometry.coordinates;
        return { lat: coordinates[1], lon: coordinates[0] };
      }
      return null;
    } catch (error) {
      console.error('Error fetching coordinates from address', error);
      return null;
    }
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

  selectPaymentMethod(method: 'googlePay' | 'stripe' | 'pod'): void {
    this.selectedPaymentMethod = method;
  }

  // Trigger payment based on selected method
  proceedWithPayment(): void {
    if (!this.selectedPaymentMethod) {
      this.notificationService.notifyUser('errorSnack', 'Please select a payment method.');
      return;
    }

    switch (this.selectedPaymentMethod) {
      case 'googlePay':
        // Insert your Google Pay processing logic here
        console.log('Processing Google Pay...');
        break;
      case 'stripe':
        // Insert your Stripe processing logic here
        console.log('Processing Stripe payment...');
        break;
      case 'pod':
        // Process Cash on Delivery confirmation here
        console.log('Processing Cash on Delivery...');
        break;
      default:
        break;
    }
  }

}
