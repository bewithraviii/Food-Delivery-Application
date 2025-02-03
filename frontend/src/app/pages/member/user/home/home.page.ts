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
  selectedCategory: string = '';
  categories: any[] = []
  filteredRestaurants: any[] = [];
  restaurants: any[] = [];
  user: any = {
    name: '...',
    phoneNumber: '...',
    email: '...',
    id: ''
  };
  favoriteList: any[] = [];
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
    await this.getCategories();
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
    this.addressExtractionService.setAddresses([this.selectedAddress]);
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
      const currentLocation = { name: 'location', details: this.detectedAddress, type: 'location' };
      this.selectedAddress = currentLocation;
      this.addressExtractionService.setAddresses([this.selectedAddress]);
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
          this.addressExtractionService.setAddresses([this.selectedAddress]);
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
        this.addressExtractionService.setAddresses([this.selectedAddress]);
        this.favoriteList = data.favorites;
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
            const isFavorite = this.favoriteList.some((favorite: any) => favorite.restaurantId === details.id);
            this.restaurants.push(
              { 
                id: details.id,
                name: details.name,  
                image: 'assets/images/restaurant-interior.jpg', 
                rating: details.ratings, 
                deliveryTime: '20', 
                priceForTwo: details.priceForTwo,
                cuisine: details.cuisineType,
                address: extractedAddress,
                distance: '0.8',
                favorite: isFavorite
              }
            );
          });
          this.filteredRestaurants = [...this.restaurants];
        }
      }
    );
  }

  async restaurantDetails(restaurantId: string){
    this.router.navigate(["/user-dashboard/restaurant", restaurantId]);
  }

  async getCategories() {
    this.apiService.getAllCategories().subscribe(
      (data: any) => {
        const categoryImageMap: { [key: string]: string } = {
          'Pizza': 'assets/images/pizza.jfif',
          'Burger': 'assets/images/burger.jfif',
          'Rolls': 'assets/images/rolls.jfif',
          'Salads': 'assets/images/salads.jfif',
          'Coffee': 'assets/images/coffee.jfif',
          'Shakes': 'assets/images/shakes.jfif',
          'Chinese': 'assets/images/chinese.jfif',
          'North Indian': 'assets/images/north-indian.jfif',
          'South Indian': 'assets/images/south-indian.jfif',
          'Sandwhich': 'assets/images/sandwhich.jfif',
          'Tea': 'assets/images/tea.jfif',
          'Cake': 'assets/images/cake.jfif'
        };

        data.payload.forEach((categoryName: string) => {
          const imagePath = categoryImageMap[categoryName]
          this.categories.push({ name: categoryName, image: imagePath });
        });
      },
      (error: any) => {
        console.error(error.error.message);
      }
    );
  }

  async applyFavorite(favorite: boolean) {
    await this.presentLoader();
    this.filteredRestaurants = this.filteredRestaurants.filter((restaurants: any) => restaurants.favorite == favorite);
    this.dismissLoader();
  }

  async applyCategory(category: any) {
    await this.presentLoader();
    if (this.selectedCategory === category.name) {
      this.selectedCategory = '';
      this.filteredRestaurants = [...this.restaurants];
    } else {
      this.selectedCategory = category.name;
      this.filteredRestaurants = this.restaurants.filter(restaurant =>
        restaurant.cuisine?.some((cuisine: any) => 
          cuisine?.categoryName?.toLowerCase() == this.selectedCategory.toLowerCase()
        )
      );
    }
    this.dismissLoader();
  }

}
