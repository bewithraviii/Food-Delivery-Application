import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { addToCartReqForm } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';

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
  filteredMenu: any[] = [
    // {
    //   categoryName: "Signature Coffee",
    //   items: [
    //     {
    //       id: 1,
    //       name: 'Next Level Coffee',
    //       description: "Serves 1. It is a special blend which is a level above normal coffee created specially for ahmedabad signature taste.",
    //       price: 155,
    //       ratings: 4.2,
    //       ratingsCount: '45',
    //     },
    //     {
    //       id: 2,
    //       name: 'Kadak Coffee',
    //       description: "Serves 1. Strong & dark to keep you Kadak day & night.",
    //       price: 155,
    //       ratings: 4,
    //       ratingsCount: '18',
    //     }
    //   ],
    // },
    // {
    //   categoryName: "Flavour Coffee",
    //   items: [
    //     {
    //       id: 3,
    //       name: 'Nut-khatt Coffee',
    //       description: "Serves 1. Hazelnut flavoured coffee. Pee kar dekho pyaar ho jayega.",
    //       price: 190,
    //       ratings: 4.2,
    //       ratingsCount: '45',
    //     },
    //     {
    //       id: 4,
    //       name: 'Pataka Coffee',
    //       description: "Serves 1. Popcorn flavoured coffee. Take it to your next corner seat.",
    //       price: 190,
    //       ratings: 4,
    //       ratingsCount: '18',
    //     },
    //     {
    //       id: 5,
    //       name: 'Minto - Rani Coffee',
    //       description: "Serves 1. Pepper mint flavour, Coffee made using high quality indian origin cocoa beans.",
    //       price: 190,
    //       ratings: 4,
    //       ratingsCount: '18',
    //     }
    //   ],
    // },
    // {
    //   categoryName: "Milk Shakes",
    //   items: [
    //     {
    //       id: 6,
    //       name: 'Boom Boom Shake',
    //       description: "Serves 1. Bubble gum flavoured shake. It will cherish your childhood memories.",
    //       price: 175,
    //       ratings: 4.2,
    //       ratingsCount: '45',
    //     },
    //     {
    //       id: 7,
    //       name: 'Popeye Shake',
    //       description: "Serves 1. Banana shake. Did too many reps today. Have some old school banana shake.",
    //       price: 160,
    //       ratings: 4,
    //       ratingsCount: '18',
    //     },
    //     {
    //       id: 8,
    //       name: 'Berry -piya Shake',
    //       description: "Serves 1. Its pink & sweet, to satisfy your sweet tooth.",
    //       price: 120,
    //       ratings: 4,
    //       ratingsCount: '18',
    //     },
    //     {
    //       id: 9,
    //       name: 'Chocolatey Patola Shake',
    //       description: "Serves 1. Its sweet & known to make you happy.",
    //       price: 190,
    //       ratings: 4,
    //       ratingsCount: '18',
    //     }
    //   ],
    // }
  ];
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
  userId: any = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private dialogService: DialogService
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
    this.filteredMenu = this.restaurantDetails.menu.filter((category: any) =>
      category.items.some((item: any) =>
        item.name.toLowerCase().includes(query)
      )
    );
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
              itemId: item.id,
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
      },
      (error: any) => {
        console.error('Error adding item to cart:', error);
      }
    );
  }

}
