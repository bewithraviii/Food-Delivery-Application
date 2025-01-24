import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Route, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { addNewAddressRequest, addToCartReqForm, applyCouponReqForm, removeCouponReqForm } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';
import { AddressExtractionService } from 'src/app/services/util/address-extraction.service';



@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  cartExists: boolean = false;
  cartDataLoaded: boolean = false;
  isDesktop: boolean = true;
  selectedAddress: string = '';
  isPayment: boolean = false;
  user: any;
  addresses: any[] = [];
  cartId: string = '';
  cartDetails: any[] = [];
  billDetails: any[] = [
    { label: 'Item Total', amount: 0 },
    { label: 'Delivery Fee', amount: 0 },
    { label: 'Platform Fee', amount: 0 },
    { label: 'GST and Restaurant Charges', amount: 0 },
  ]
  totalAmount: number = 0;
  discountedPrice: number = 0;
  discountApplied: boolean = false;
  selectedDeal: any = {};
  addressFormGroup!: FormGroup;
  paymentFormGroup!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private addressExtractionService: AddressExtractionService,
    private loadingController: LoadingController,
    private dialogService: DialogService,
    private notificationService: NotificationService,
  ) { }

  async ngOnInit() {
    this.checkScreenSize();
    this.initializeForms();
    await this.populateData();
    this.fetchSelectedAddress();
  }

  fetchSelectedAddress() {
    const addresses = this.addressExtractionService.getAddresses();
    if(addresses.length > 0){
      this.selectedAddress = addresses[0].details
    }
  }

  async populateData() {
    this.user = this.authService.getUserId();
    this.apiService.getUserCartData(this.user).subscribe(
      (data: any) => {
        if(data){
          this.cartId = data.payload._id;
          this.cartExists = true;
          data.payload.cartItems.forEach((element: any) => {
            this.cartDetails.push(element);
          });
          if(data.payload.billDetails && data.payload.totalAmount){
            this.billDetails = data.payload.billDetails;
            this.totalAmount = data.payload.totalAmount;
            this.cartDataLoaded = true;
          }
        }
      },
      (error: any) => {
        console.log(error.message);
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

  initializeForms() {
    this.addressFormGroup = this.fb.group({
      address: ['', Validators.required]
    });
    this.paymentFormGroup = this.fb.group({
      paymentMethod: ['', Validators.required]
    });
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
  }

  async increaseQuantity(orderItem: any) {
    await this.presentLoader('Updating Cart...');
    const payload: addToCartReqForm = {
      userId: this.user,
      cartItems: [
        {
          restaurant: {
            restaurantId: this.cartDetails[0].restaurant.restaurantId,
            name: this.cartDetails[0].restaurant.name,
            address: this.cartDetails[0].restaurant.address,
            restaurantCharges: this.cartDetails[0].restaurant.restaurantCharges || 0,
            orderItem: [{
              itemId: orderItem.itemId,
              name: orderItem.name,
              price: orderItem.price,
              quantity: 1,
            }]
          },
        }
      ]
    }
    this.apiService.addToCart(payload).subscribe(
      (response: any) => {
        if(response){
          this.cartDetails = [];
          response.payload.cartItems.forEach((element: any) => {
            this.cartDetails.push(element);
          });
          if(response.payload.billDetails && response.payload.totalAmount){
            this.billDetails = response.payload.billDetails;
            this.totalAmount = response.payload.totalAmount;
          }
          this.discountedPrice = 0;
          this.discountApplied = false;
          this.selectedDeal = {};
        }
        this.dismissLoader();
      },
      (error: any) => {
        console.error('Error adding item to cart:', error);
        this.dismissLoader();
      }
    );
  }

  async decreaseQuantity(orderItem: any) {
    await this.presentLoader('Updating Cart...');
    const payload: addToCartReqForm = {
      userId: this.user,
      cartItems: [
        {
          restaurant: {
            restaurantId: this.cartDetails[0].restaurant.restaurantId,
            name: this.cartDetails[0].restaurant.name,
            address: this.cartDetails[0].restaurant.address,
            restaurantCharges: this.cartDetails[0].restaurant.restaurantCharges || 0,
            orderItem: [{
              itemId: orderItem.itemId,
              name: orderItem.name,
              price: orderItem.price,
              quantity: 1,
            }]
          },
        }
      ]
    }
    this.apiService.removeFromCart(payload).subscribe(
      (response: any) => {
        if(response){
          if(response.payload == null){
            this.cartDataLoaded = false;
            this.dismissLoader();
            window.location.reload();
          } else {
            this.cartDetails = [];
            response.payload.cartItems.forEach((element: any) => {
              this.cartDetails.push(element);
            });
            if(response.payload.billDetails && response.payload.totalAmount){
              this.billDetails = response.payload.billDetails;
              this.totalAmount = response.payload.totalAmount;
            }
            this.discountedPrice = 0;
            this.discountApplied = false;
            this.selectedDeal = {};
            this.dismissLoader();
          }
        }
      },
      (error: any) => {
        console.error('Error removing item from cart:', error);
        this.dismissLoader();
      }
    );
  }

  selectAddress(address: string) {
    this.selectedAddress = address;
    this.addressFormGroup.patchValue({ address: this.selectedAddress });
    this.addressExtractionService.setAddresses([{details: this.selectedAddress}]);
    this.stepper.next();
  }

  processPaymentPage() {
    this.isPayment = !this.isPayment;
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

  async calculateTravelTime(destination: string) {
    let restaurantCoords: any;  
    let destinationCoords: any;

    restaurantCoords = await this.getCoordsOfAddress(this.cartDetails[0].restaurant?.address);
    destinationCoords = await this.getCoordsOfAddress(destination);

    if(restaurantCoords !== null || undefined && destinationCoords !== null || undefined) {
      const start = `${restaurantCoords.lon},${restaurantCoords.lat}`;
      const end = `${destinationCoords.lon},${destinationCoords.lat}`;
      this.apiService.getDistanceTrackTime(start, end).subscribe(
        (response: any) => {
          console.log(response);
          const travelTimeInSeconds = response.features[0].properties.summary.duration;
          const travelTimeInMinutes = travelTimeInSeconds / 60;
  
          console.log('Travel Time (minutes):', travelTimeInMinutes.toFixed(0));
          // this.notificationService.notifyUser("successSnack", `Estimated travel time: ${travelTimeInMinutes.toFixed(2)} minutes`);
          // return travelTimeInMinutes.toFixed(2);
        },
        (error: any) => {
          console.error('Error calculating travel time', error);
          this.notificationService.notifyUser("errorSnack", "Error calculating travel time.");
        }
      );
    }
  }

  async onAddressSelected(address: string) {
    await this.calculateTravelTime(address);
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

  doesSelectedAddressExist(): boolean {
    if (!this.selectedAddress) {
      return false;
    } else {

      const result = this.addresses.some(addr => addr.details === this.selectedAddress);
      if(result){
        return true;
      } else {
        return false;
      }
    }
    
  }

  async removeAppliedCoupon(deal: any) {
    await this.presentLoader('Removing Coupon...');
    const removeCouponReqPayload: removeCouponReqForm = {
      userId: this.user,
    }
    this.apiService.removeCoupon(removeCouponReqPayload).subscribe(
      (response: any) => {
        if(response) {
          this.cartDetails = [];
          response.payload.cartItems.forEach((element: any) => {
            this.cartDetails.push(element);
          });
          this.billDetails = response.payload.billDetails;
          this.totalAmount = response.payload.totalAmount;
          this.discountedPrice = 0;
          this.discountApplied = false;
          this.selectedDeal = {};
          this.dismissLoader();
        }
      },
      (error: any) => {
        this.dismissLoader();
        console.log(error.error.message || "Something went wrong while removing coupon.");
        this.notificationService.notifyUser("errorSnack", error.error.message);
      }
    )
  }

  async applyCoupon() {
    const restaurantDeals = await this.getRestaurantDeals();

    const dealSelected = await this.dialogService.dealsDialog(restaurantDeals);
    if(dealSelected){ 
      await this.presentLoader('Applying Coupon...');

      const applyCouponReqPayload: applyCouponReqForm = {
        restaurantId: this.cartDetails[0].restaurant.restaurantId,
        cartId: this.cartId,
        dealId: dealSelected._id
      }

      this.apiService.applyCoupon(applyCouponReqPayload).subscribe(
        (response: any) => {

          if(response.dealApplied) {
            this.cartDetails = [];
            response.payload.cartItems.forEach((element: any) => {
              this.cartDetails.push(element);
            });
            this.billDetails = response.payload.billDetails;
            this.totalAmount = response.payload.totalAmount;
            this.discountedPrice = response.discountedPrice;
            this.discountApplied = response.dealApplied;
            this.selectedDeal = dealSelected;
            this.dismissLoader();
            this.showCouponAppliedModal(this.discountedPrice, this.selectedDeal);
          } else {
            this.notificationService.notifyUser("successSnack", response.message);
            this.discountApplied = response.dealApplied;
            this.dismissLoader();
          }
        },
        (error: any) => {
          this.dismissLoader();
          console.log(error.message || "Something went wrong while applying coupon.");
          this.notificationService.notifyUser("errorSnack", error.error.message);
        }
      )
    }
  }

  async showCouponAppliedModal(discountedPrice: number, selectedDeal: any){
      const deal = {
        ...selectedDeal,
        discountedPrice: discountedPrice,
      }
      await this.dialogService.dealsDialog(deal, true);
  }

  async getRestaurantDeals(): Promise<any[]> {
    await this.presentLoader('Loading...');
    
    try {
      let responseDealData: any[] = [];
      const restaurantId = this.cartDetails[0].restaurant.restaurantId;
      const response = await this.apiService.getRestaurantDeals(restaurantId).toPromise();
      if(response && response.payload) {
          responseDealData = response.payload;
      }
      await this.dismissLoader();
      return responseDealData;

    } catch (error: any) {
      console.log(error.message || "Something went wrong while fetching restaurant deals.");
      this.dismissLoader();
      return [];
    }
  }

}
