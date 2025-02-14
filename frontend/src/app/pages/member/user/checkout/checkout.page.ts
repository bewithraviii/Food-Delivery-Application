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

  isDesktop: boolean = true;
  addressFormGroup!: FormGroup;
  addresses: any[] = [];
  selectedAddress: string = '';
  selectedAddressData: any = {};
  user: any;
  cartDetails: cartDataModel[] = [];
  totalAmount: number = 0;
  billDetails: any[] = [
    { label: 'Item Total', amount: 0 },
    { label: 'Delivery Fee', amount: 0 },
    { label: 'Platform Fee', amount: 0 },
    { label: 'GST and Restaurant Charges', amount: 0 },
  ]


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
    this.addresses = [];
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
    this.apiService.getUserCartDataForCheckout(this.user).subscribe(
      async (data: any) => {
        if(data){
          data.payload.cartItems.forEach((cart: any) => {
            this.cartDetails.push = cart;
            console.log(this.cartDetails);
            this.deliveryTime(this.selectedAddressData.details, this.cartDetails[0]?.restaurant?.address);
          });
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


}
