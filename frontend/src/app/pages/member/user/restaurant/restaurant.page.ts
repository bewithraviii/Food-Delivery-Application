import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
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
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.restaurantId = params['id'];
    });

    if(this.restaurantId){
      this.fetchRestaurantDetails(this.restaurantId);
    }
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
        desc: deal.desc, 
        termsAndCondition: deal.termsAndCondition
      };

      this.dialogService.openDialog("Offer Details", contextData, null, null, true);
  }

}
