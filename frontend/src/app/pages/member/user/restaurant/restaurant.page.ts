import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';

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
  restaurantId?: string;
  restaurantDetails: any = {};
  searchQuery: string = '';
  filteredMenu: any[] = [];
  offersAndDeals: any[] = [
    {
      code: "STEALDEAL",
      title: '60% Off Upto ₹120', 
      desc: 'Use code STEALDEAL & get 60% off on orders above ₹189. Maximum discount: ₹120.', 
      termsAndCondition: [
        { describe: 'Offer is valid only on select restaurants' },
        { describe: 'Coupon code can be applied only once in 2 hrs on this restaurant' },
        { describe: 'Other T&Cs may apply' },
        { describe: 'Offer valid till Dec 31, 2025 11:59 PM' },
      ]
    },
    {
      code: "FLATDEAL",
      title: 'Get Flat Rs.125 off', 
      desc: 'Use code FLATDEAL & get FLAT ₹125 Off on orders above ₹399', 
      termsAndCondition: [
        { describe: 'Offer is valid only on select restaurants' },
        { describe: 'Coupon code can be applied only once in 2 hrs on this restaurant' },
        { describe: 'Other T&Cs may apply' },
        { describe: 'Offer valid till Dec 31, 2025 11:59 PM' },
      ]
    },
    {
      code: "FLAT150",
      title: 'Get Flat Rs. 150 off', 
      desc: 'Use code FLAT150 & get flat ₹150 off orders above ₹549.', 
      termsAndCondition: [
        { describe: 'Offer is valid only on select restaurants' },
        { describe: 'Coupon code can be applied only once in 2 hrs on this restaurant' },
        { describe: 'Other T&Cs may apply' },
        { describe: 'Offer valid till Dec 31, 2025 11:59 PM' },
      ]
    },
    {
      code: "STEALDEAL",
      title: '60% Off Upto ₹120', 
      desc: 'Use code STEALDEAL & get 60% off on orders above ₹189. Maximum discount: ₹120.', 
      termsAndCondition: [
        { describe: 'Offer is valid only on select restaurants' },
        { describe: 'Coupon code can be applied only once in 2 hrs on this restaurant' },
        { describe: 'Other T&Cs may apply' },
        { describe: 'Offer valid till Dec 31, 2025 11:59 PM' },
      ]
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cd: ChangeDetectorRef,

  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.restaurantId = params['id'];
    });

    if(this.restaurantId){
      this.fetchRestaurantDetails(this.restaurantId);
    }
  }

  // ngAfterViewInit() {
  //   if (this.dealCards) {
  //     this.updateVisibleCards();
  //     this.updateButtonStates();
  
  //     // Add scroll event listener
  //     this.dealCards.nativeElement.addEventListener('scroll', () => this.updateButtonStates());
  //     window.addEventListener('resize', () => this.updateVisibleCards());
  //   }
  // }
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

  // scrollLeft() {
  //   const scrollContainer = this.dealCards.nativeElement;
  //   const cardWidth = scrollContainer.querySelector('ion-card').offsetWidth;
  //   scrollContainer.scrollBy({
  //     left: -(cardWidth * this.visibleCardsCount), // Scroll by visible cards
  //     behavior: 'smooth'
  //   });
  //   setTimeout(() => this.updateButtonStates(), 300);
  // }

  // scrollRight() {
  //   const scrollContainer = this.dealCards.nativeElement;
  //   const cardWidth = scrollContainer.querySelector('ion-card').offsetWidth;
  //   scrollContainer.scrollBy({
  //     left: cardWidth * this.visibleCardsCount, // Scroll by visible cards
  //     behavior: 'smooth'
  //   });
  
  //   setTimeout(() => this.updateButtonStates(), 300); // Update after the scroll is done
  // }

  // updateButtonStates() {
  //   const scrollContainer = this.dealCards.nativeElement;
  //   const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
  
  //   this.isPrevDisabled = scrollContainer.scrollLeft <= 0;
  //   this.isNextDisabled = scrollContainer.scrollLeft >= maxScrollLeft;
  
  //   this.cd.detectChanges();
  // }

  scrollLeft() {
    const scrollContainer = this.dealCards.nativeElement;
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
    const scrollContainer = this.dealCards.nativeElement;
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
    const scrollContainer = this.dealCards.nativeElement;
    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
     this.isPrevDisabled = scrollContainer.scrollLeft === 0;
     this.isNextDisabled = scrollContainer.scrollLeft >= maxScrollLeft;
    this.cd.detectChanges();
  }

}
