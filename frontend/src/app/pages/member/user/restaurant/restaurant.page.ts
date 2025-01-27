import { Element } from '@angular/compiler';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { addToCartReqForm, addToFavorite } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.page.html',
  styleUrls: ['./restaurant.page.scss'],
})
export class RestaurantPage implements OnInit {
  
  @ViewChild('dealCards', { read: ElementRef }) dealCards!: ElementRef;

  visibleCardsCount = 1;
  isPrevDisabled = true;
  isNextDisabled = false;
  restaurantId: string = '';
  restaurantDetails: any = {};
  searchQuery: string = '';
  filteredMenu: any[] = [];
  offersAndDeals: any[] = [
    {
      code: "STEALDEAL",
      title: '60% Off Upto ₹120', 
      description: 'Use code STEALDEAL & get 60% off on orders above ₹189. Maximum discount: ₹120.', 
      termsAndCondition: [
        { terms: 'Offer is valid only on select restaurants' },
        { terms: 'Coupon code can be applied only once in 2 hrs on this restaurant' },
        { terms: 'Other T&Cs may apply' },
        { terms: 'Offer valid till Dec 31, 2025 11:59 PM' },
      ]
    },
    {
      code: "FLATDEAL",
      title: 'Get Flat Rs.125 off', 
      description: 'Use code FLATDEAL & get FLAT ₹125 Off on orders above ₹399', 
      termsAndCondition: [
        { terms: 'Offer is valid only on select restaurants' },
        { terms: 'Coupon code can be applied only once in 2 hrs on this restaurant' },
        { terms: 'Other T&Cs may apply' },
        { terms: 'Offer valid till Dec 31, 2025 11:59 PM' },
      ]
    },
    {
      code: "FLAT150",
      title: 'Get Flat Rs. 150 off', 
      description: 'Use code FLAT150 & get flat ₹150 off orders above ₹549.', 
      termsAndCondition: [
        { terms: 'Offer is valid only on select restaurants' },
        { terms: 'Coupon code can be applied only once in 2 hrs on this restaurant' },
        { terms: 'Other T&Cs may apply' },
        { terms: 'Offer valid till Dec 31, 2025 11:59 PM' },
      ]
    },
    {
      code: "STEALDEAL",
      title: '60% Off Upto ₹120', 
      description: 'Use code STEALDEAL & get 60% off on orders above ₹189. Maximum discount: ₹120.', 
      termsAndCondition: [
        { terms: 'Offer is valid only on select restaurants' },
        { terms: 'Coupon code can be applied only once in 2 hrs on this restaurant' },
        { terms: 'Other T&Cs may apply' },
        { terms: 'Offer valid till Dec 31, 2025 11:59 PM' },
      ]
    },
  ];
  isFavorite: boolean = false;
  userId: any = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private dialogService: DialogService,
    private toastController: ToastController,
    private notificationService: NotificationService,
    private loadingController: LoadingController,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.restaurantId = params['id'];
    });

    if(this.restaurantId){
      this.fetchRestaurantDetails(this.restaurantId);
    }

    const user = this.authService.getUserId();
    if(!user || user == null){
      this.authService.logout();
    }
    this.userId = user;
    this.validateIsFavorite();
  }

  ngAfterViewInit() {
    if (this.dealCards) {
      this.updateVisibleCards();
      this.updateButtonStates();
      window.addEventListener('resize', () => this.updateVisibleCards());
    }
  }

  updateVisibleCards() {
    const width = window.innerWidth;
    if (width < 576) {
      this.visibleCardsCount = 1;
    } else if (width < 768) {
      this.visibleCardsCount = 2;
    } else if (width < 992) {
      this.visibleCardsCount = 2;
    } else {
      this.visibleCardsCount = 2;
    }
    this.updateButtonStates();
    this.cd.detectChanges();
  }
  
  fetchRestaurantDetails(id: string) {
    this.apiService.getRestaurantDetails(id).subscribe(
      (response: any) => {
        this.restaurantDetails = response.payload;
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  filterMenu() {
    const query = this.searchQuery.toLowerCase();
    if(query){
      let filteredMenu = this.restaurantDetails.menu.map((category: any) => {
        const filteredItems = category.items.filter((item: any) => 
          item.name.toLowerCase().includes(query)
        );
        return filteredItems;
      });
      filteredMenu = filteredMenu.filter((itemArray: any[]) => itemArray.length > 0);
      this.filteredMenu = filteredMenu;
    } else {
      this.filteredMenu = [];
    }
  }

  scrollLeft() {
    const scrollContainer = this.dealCards.nativeElement;
    const cardWidth = scrollContainer.querySelector('ion-card').offsetWidth;
    scrollContainer.scrollBy({
      left: -(cardWidth * this.visibleCardsCount),
      behavior: 'smooth'
    });
    this.updateButtonStates();
  }

  scrollRight() {
    const scrollContainer = this.dealCards.nativeElement;
    const cardWidth = scrollContainer.querySelector('ion-card').offsetWidth;
    scrollContainer.scrollBy({
      left: cardWidth * this.visibleCardsCount,
      behavior: 'smooth'
    });
    this.updateButtonStates();
  }

  updateButtonStates() {
    const scrollContainer = this.dealCards.nativeElement;
    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
     this.isPrevDisabled = scrollContainer.scrollLeft === 0;
     this.isNextDisabled = scrollContainer.scrollLeft >= maxScrollLeft;
    this.cd.detectChanges();
  }

  openDealDialog(deal: any){
      const contextData = {
        identity: "deals",
        code: deal.code,
        title: deal.title, 
        description: deal.description, 
        termsAndCondition: deal.termsAndCondition
      };

      this.dialogService.openDialog("Offer Details", contextData, null, null, true);
  }

  addToCart(item: any) {
    const payload: addToCartReqForm = {
      userId: this.userId,
      cartItems: [
        {
          restaurant: {
            restaurantId: this.restaurantId,
            name: this.restaurantDetails.name,
            address: this.restaurantDetails.address,
            restaurantCharges: this.restaurantDetails.restaurantCharges || 0,
            orderItem: [{
              itemId: item.itemId,
              name: item.name,
              price: item.price,
              quantity: 1,
            }]
          },
        }
      ]
    }
    
    this.apiService.addToCart(payload).subscribe(
      (response: any) => {
        console.log('Item added to cart:', response);
        this.addedToCartNotify("ITEM ADDED TO CART");
      },
      (error: any) => {
        console.error('Error adding item to cart:', error);
        this.notificationService.notifyUser("errorSnack", error.error.message || 'Your cart already contains other restaurant order, Please continue or empty cart.');
      }
    );
  }

  async addedToCartNotify(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 50000,
      position: 'bottom',
      cssClass: 'custom-cart-notification',
      buttons: [
        {
          text: 'View Cart',
          handler: () => {
            this.router.navigate(['/user-dashboard/cart']);
          },
          role: 'cancel',
        }
      ]
    });
    toast.present();
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

  async addToFavorite(restaurantId: string) {
    await this.presentLoader("Loading...");
    const requestPayload: addToFavorite = {
      userId: this.userId,
      restaurantId: restaurantId
    }
    this.apiService.addToFavorite(requestPayload).subscribe(
      (data: any) => {
        if (data && data.payload) {
          this.isFavorite = data.payload.isSaved;
          this.notificationService.notifyUser("successSnack", data.message);
        }
        this.dismissLoader();
      },
      (error: any) => {
        console.error(error);
        this.dismissLoader();
        this.notificationService.notifyUser("errorSnack", error.error.message || 'Add or Remove from favorite is failed.');
      }
    );
  }

  validateIsFavorite() {
    this.apiService.getUserDetails().subscribe(
      (data: any) => {
        if (data && data.payload.favorites.length > 0) {
          const checkFavorites = data.payload.favorites.find((fav: any) => fav.restaurantId.toString() === this.restaurantId.toString());
          this.isFavorite = !!checkFavorites;
        }
      },
      (error: any) => {
        this.notificationService.notifyUser("errorSnack", error.error.message || 'Users Favorite not found');
      }
    );
  }

}
