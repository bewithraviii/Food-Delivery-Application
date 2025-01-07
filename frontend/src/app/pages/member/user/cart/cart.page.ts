import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LoadingController } from '@ionic/angular';
import { addNewAddressRequest } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {

  isDesktop: boolean = true;
  selectedAddress: any;
  user: any = {
    id: '677ccd7737961190f527050d'
  };
  addresses = [
    { title: 'Home', details: 'A-701 Avalon-60, Motera, Gujarat'},
    { title: 'Work', details: 'Tatvasoft house, PRL Colony, Gujarat'},
    { title: 'Friends And Family', details: 'M-7, Nirnay Nagar, Gujarat'}
  ];
  restaurant = {
   name: "La Pino'z Pizza",
   address: "Shop No. 113, 1st floor, Aditya Avenue, opp. Krishna Bunglows, Havmore Circle, Ahmedabad, Gujarat 380005",
  };
  orderItem = { name: 'Pesto & Basil Special Pizza', price: '₹414', quantity: 1 };
  billDetails = [
    { label: 'Item Total', amount: '₹414' },
    { label: 'Delivery Fee', amount: '₹41' },
    { label: 'Platform Fee', amount: '₹9' },
    { label: 'GST and Restaurant Charges', amount: '₹48.57' },
  ];
  totalAmount = '₹513';

  addressFormGroup!: FormGroup;
  paymentFormGroup!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private dialogService: DialogService,
    private notificationService: NotificationService
  ) { }

  async ngOnInit() {
    this.checkScreenSize();
    this.initializeForms();
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

  async addNewAddress() {
    const fields = [
      { name: 'title', label: 'Title', value: '', options: ['Home', 'Work', 'Other'], validators: [Validators.required] },
      { name: 'details', label: 'Details', type: 'text', value: '', validators: [Validators.required] },
    ];
    const addAddress = { title: '', details: '' }
    const addedAddress = await this.dialogService.openDialog(
      "Add Address",
      { newAddress: addAddress, identity: 'form' },
      fields,
      null,
    );

    if(addedAddress){
      await this.presentLoader('Adding address...');
      const requestPayload: addNewAddressRequest = {
        userId: this.user.id,
        title: addedAddress.title,
        detail: addedAddress.details,
      }
      this.apiService.addNewAddress(requestPayload).subscribe(
        (response: any) => {
          this.addresses = [];
          response.payload.address.forEach((address: any) => {
            this.addresses.push(address);
          });
          this.dismissLoader();
          this.notificationService.notifyUser("successSnack", "New address successfully added.");
        },
        (error: any) => {
          console.error('Error adding new address', error);
          this.dismissLoader();
          this.notificationService.notifyUser("errorSnack", error.error.message || "Error adding new address.");
        }
      );
    }
  }

  increaseQuantity() {
    this.orderItem.quantity++;
  }

  decreaseQuantity() {
    if (this.orderItem.quantity > 1) {
      this.orderItem.quantity--;
    }
  }

  selectAddress(address: any, stepper: any) {
    this.selectedAddress = address;
    stepper.next(); // Move to the next step (Payment Section)
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

    restaurantCoords = await this.getCoordsOfAddress(this.restaurant.address);
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

}
