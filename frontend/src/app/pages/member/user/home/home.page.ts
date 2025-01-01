import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { addNewAddressRequest } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { AddressExtractionService } from 'src/app/services/util/address-extraction.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild('categoryCards', { read: ElementRef }) categoryCards!: ElementRef;
  @ViewChild('addressPanel') addressPanel!: MatExpansionPanel;
  userName: string = '' || "Ravi";
  greeting: string = '';
  isPrevDisabled = true;
  isNextDisabled = false;
  visibleCardsCount = 1;
  detectedAddress: string = ''; 
  selectedAddress: any;

  categories = [
    {name: 'Pizza', image: 'assets/images/pizza.jfif'},
    {name: 'Burger', image: 'assets/images/burger.jfif'},
    {name: 'Rolls', image: 'assets/images/rolls.jfif'},
    {name: 'Salads', image: 'assets/images/salads.jfif'},
    {name: 'Shakes', image: 'assets/images/shakes.jfif'},
    {name: 'Chinese', image: 'assets/images/chinese.jfif'},
    {name: 'North Indian', image: 'assets/images/north-indian.jfif'},
    {name: 'South Indian', image: 'assets/images/south-indian.jfif'},
    {name: 'Sandwhich', image: 'assets/images/sandwhich.jfif'},
    {name: 'Tea', image: 'assets/images/tea.jfif'},
    {name: 'Cake', image: 'assets/images/cake.jfif'},
  ]

  restaurants: any[] = [];
  user: any = {
    name: '...',
    phoneNumber: '...',
    email: '...',
    id: ''
  };
  savedAddresses: { name: string, details: string, type: string }[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService,
    private dialogService: DialogService,
    private cd: ChangeDetectorRef,
    private loadingController: LoadingController,
    private addressExtractionService: AddressExtractionService,
  ) { }


  async ngOnInit() {
    await this.getUserData();
    await this.getRestaurantData();
    this.setGreeting();
  }

  setGreeting(){
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      this.greeting = 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      this.greeting = 'Good Afternoon';
    } else if (currentHour >= 17 && currentHour < 21) {
      this.greeting = 'Good Evening';
    } else {
      this.greeting = 'Good Night';
    }
  }

  ngAfterViewInit() {
    if (this.categoryCards) {
      this.updateVisibleCards();
      this.updateButtonStates();
      window.addEventListener('resize', () => this.updateVisibleCards());
    }
  }
  
  async selectAddress(address: any) {
    await this.presentLoader();
    this.selectedAddress = address;
    this.addressPanel.close();
    await this.dismissLoader()
  }

  detectCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.getAddressFromCoordinates(lat, lng);
      }, (error) => {
        console.error(error);
        alert("Unable to fetch location");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  async getAddressFromCoordinates(lat: number, lng: number) {
    await this.presentLoader();
    this.apiService.getLocationFromLatAndLong(lat,lng).subscribe((response: any) => {
      this.detectedAddress = response.display_name;
      this.selectedAddress = { name: 'location', details: this.detectedAddress, type: 'location' };
      this.addressPanel.close();
      this.dismissLoader();
    }, error => {
      console.error('HTTP request error', error);
      this.dismissLoader();
    });
  }

  navigateToSearch(){
    this.router.navigate(["/user-dashboard/search"]);
  }

  updateVisibleCards() {
    const width = window.innerWidth;
    if (width < 576) {
      this.visibleCardsCount = 2;
    } else if (width < 768) {
      this.visibleCardsCount = 3;
    } else if (width < 992) {
      this.visibleCardsCount = 3;
    } else {
      this.visibleCardsCount = 6;
    }
    this.updateButtonStates();
    this.cd.detectChanges();
  }

  scrollLeft() {
    const scrollContainer = this.categoryCards.nativeElement;
    const cardWidth = scrollContainer.querySelector('ion-card').offsetWidth;
    scrollContainer.scrollBy({
      left: -(cardWidth * this.visibleCardsCount), // Scroll by visible cards
      behavior: 'smooth'
    });
    this.updateButtonStates();
    // scrollContainer.scrollBy({
    //   left: -300, // Adjust this value to control how far to scroll
    //   behavior: 'smooth'
    // });
  }

  scrollRight() {
    const scrollContainer = this.categoryCards.nativeElement;
    const cardWidth = scrollContainer.querySelector('ion-card').offsetWidth;
    scrollContainer.scrollBy({
      left: cardWidth * this.visibleCardsCount, // Scroll by visible cards
      behavior: 'smooth'
    });
    this.updateButtonStates();
    // scrollContainer.scrollBy({
    //   left: 300, // Adjust this value to control how far to scroll
    //   behavior: 'smooth'
    // });
  }

  updateButtonStates() {
    const scrollContainer = this.categoryCards.nativeElement;
    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
     this.isPrevDisabled = scrollContainer.scrollLeft === 0;
     this.isNextDisabled = scrollContainer.scrollLeft >= maxScrollLeft;
    this.cd.detectChanges();
  }

  getIconForAddressType(type: string): string {
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

  async addNewAddress() {
    console.log('Add new address clicked');
    this.addressPanel.close();
    const fields = [
      { name: 'title', label: 'Title', value: '', options: ['Home', 'Work', 'Other'], validators: [Validators.required] },
      { name: 'details', label: 'Details', type: 'text', value: '', validators: [Validators.required] },
    ];
    const addressData = { title: '', details: '' }
    const addedAddress = await this.dialogService.openDialog(
      "Add Address",
      { newAddress: addressData, identity: "form" },
      fields,
      null,
    );
    
    if(addedAddress){
      await this.presentLoader("Adding Address...");
      const requestPayload: addNewAddressRequest = {
        userId: this.user.id,
        title: addedAddress.title,
        detail: addedAddress.details
      }
      this.apiService.addNewAddress(requestPayload).subscribe(
        (response: any) => {
          this.savedAddresses = [];
          response.payload.address.forEach((address: any) => {
            this.savedAddresses.push({ name: address.title, details: address.details, type: address.title });;
          });
          this.selectedAddress = { name: requestPayload.title, details: requestPayload.detail, type: requestPayload.title };
          this.dismissLoader();
        },
        (error: any) => {
          console.error('Error adding new address', error);
          this.dismissLoader();
        }
      );
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

  async getUserData(){
    this.apiService.getUserDetails().subscribe((fetchedData: any) => {
      const data = fetchedData.payload;
      if(data){
        this.user.id = data.id,
        this.user.name = data.name;
        this.user.phoneNumber = data.phoneNumber;
        this.user.email = data.email;
        data.address.forEach((address: any) => {
          this.savedAddresses.push({ name: address.title, details: address.details, type: address.title });
        });
        this.selectedAddress = this.savedAddresses[0] || { name: '', details: 'Please Select Address', type: '' };
      }
    });
  }

  async getRestaurantData() {
    this.apiService.getAllRestaurantDetails().subscribe(
      (fetchedData: any) => {
        const data = fetchedData.payload;
        if(data) {
          data.forEach((details: any) => {
            const extractedAddress = this.addressExtractionService.extractAddressDetails(details.address);
            this.restaurants.push(
              { 
                id: details.id,
                name: details.name,  
                image: 'assets/images/restaurant-interior.jpg', 
                rating: '4.7', 
                deliveryTime: '20', 
                priceForTwo: '800',
                cuisine: details.cuisineType,
                address: extractedAddress,
                distance: '0.8',
              }
            );
          });
        }
      }
    );
  }

  async restaurantDetails(restaurantId: string){
    this.router.navigate(["/user-dashboard/restaurant", restaurantId]);
  }

}
