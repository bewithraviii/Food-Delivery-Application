import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { AddressExtractionService } from 'src/app/services/util/address-extraction.service';
import { EMPTY, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  @ViewChild('categoryCards', { read: ElementRef }) categoryCards!: ElementRef;
  private searchSubject = new Subject<string>();
  searchQuery: string = '';
  selectedCategory: string = '';
  visibleCardsCount = 1;
  isPrevDisabled = true;
  isNextDisabled = false;
  filteredData: any[] = [];
  restaurants: any[] = [];
  dataProcessing: boolean = false;
  showData: boolean = false;
  filterHighToLow: boolean = false;
  filterLowToHigh: boolean = false;
  filterRating4Plus: boolean = false;
  categories: any[] = [];


  constructor(
    private apiService: ApiService,
    private router: Router,
    private addressExtractionService: AddressExtractionService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getCategories();
    this.setupSearchDebounce();
  }

  private setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(750),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length === 0) {
          this.clearValues();
          return EMPTY;
        }
        return this.apiService.searchRestaurants(query);
      })
    ).subscribe(
      (data: any) => {
        this.restaurants = [];
        this.filteredData = [];
        this.dataProcessing = true;
          if(data && data.payload.length > 0){
            data.payload.forEach((details: any) => { 
              const extractedAddress = this.addressExtractionService.extractAddressDetails(details.address);
              details.address = extractedAddress;
              this.restaurants.push(details);
              this.filteredData = this.restaurants;
            });
          } else {
            this.restaurants = [];
            this.filteredData = [];
          }
          this.showData = true;
          this.dataProcessing = false;
      },
      (error: any) => {
        console.error('Error searching restaurants:', error);
        this.dataProcessing = false;
      }
    );
  }

  search() {
    const trimmedQuery = this.searchQuery.trim();
    if(this.selectedCategory !== trimmedQuery){
      this.selectedCategory = '';
    }
    if(trimmedQuery) {
      this.searchSubject.next(trimmedQuery);
    } else {
      this.clearValues();
    }
  }

  removeSearch() {
    this.clearSearchAndFilter();
    this.clearValues();
  }

  applyFilters(event: any, filterType: string): void {

    let filtered = [...this.restaurants];

    switch(filterType) { 
      case "highToLow": { 
        this.filterHighToLow = event.checked;
        if (this.filterHighToLow) {
          filtered = filtered.sort((a, b) => b.restaurantRatings - a.restaurantRatings)
          this.filterLowToHigh = false;
          this.filterRating4Plus = false;
        }
        break; 
      } 
      case "lowToHigh": { 
        this.filterLowToHigh = event.checked;
        if (this.filterLowToHigh) {
          filtered = filtered.sort((a, b) => a.restaurantRatings - b.restaurantRatings);
          this.filterHighToLow = false;
          this.filterRating4Plus = false;
        }
        break; 
      } 
      case "rating4Plus": { 
        this.filterRating4Plus = event.checked;
        if (this.filterRating4Plus) {
          filtered = filtered.filter(restaurant => restaurant.restaurantRatings >= 4);
          this.filterLowToHigh = false;
          this.filterHighToLow = false;
        }
        break; 
      }
      default: { 
        break; 
      } 
    } 

    if (!this.filterHighToLow && !this.filterLowToHigh && !this.filterRating4Plus) {
      this.filteredData = [...this.restaurants];
    } else {
      this.filteredData = filtered;
    }

  }

  async restaurantDetails(restaurantId: string){
    this.router.navigate(["/user-dashboard/restaurant", restaurantId]);
  }

  clearFilters(): void {
    this.filterHighToLow = false;
    this.filterLowToHigh = false;
    this.filterRating4Plus = false;
    this.filteredData = [...this.restaurants];
  }

  clearValues() {
    this.restaurants = [];
    this.filteredData = [];
    this.showData = false;
  }

  clearSearchAndFilter() {
    this.selectedCategory = '';
    this.searchQuery = '';
  }

  onSearchQueryChange(query: string) {
    this.clearValues();
    this.searchSubject.next(query);
  }

  async getCategories() {
    const selectedCategories = ['Pizza', 'Burger', 'Coffee', 'Shakes', 'North Indian', 'Chinese', 'Sandwhich', 'Tea'];
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
          if (selectedCategories.includes(categoryName)) {
            const imagePath = categoryImageMap[categoryName]
            this.categories.push({ name: categoryName, image: imagePath });
          }
        });
      },
      (error: any) => {
        console.error(error.error.message);
      }
    );
  }

  applyCategory(category: string){
    if (this.selectedCategory === category) {
      this.clearSearchAndFilter();
      this.showData = false;
    } else {
      this.selectedCategory = category;
      this.searchQuery = this.selectedCategory;
      this.searchSubject.next(category);
    }
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
      left: -(cardWidth * this.visibleCardsCount),
      behavior: 'smooth'
    });
    this.updateButtonStates();

  }

  scrollRight() {
    const scrollContainer = this.categoryCards.nativeElement;
    const cardWidth = scrollContainer.querySelector('ion-card').offsetWidth;
    scrollContainer.scrollBy({
      left: cardWidth * this.visibleCardsCount,
      behavior: 'smooth'
    });
    this.updateButtonStates();
  }

  updateButtonStates() {
    const scrollContainer = this.categoryCards.nativeElement;
    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
     this.isPrevDisabled = scrollContainer.scrollLeft === 0;
     this.isNextDisabled = scrollContainer.scrollLeft >= maxScrollLeft;
    this.cd.detectChanges();
  }

}
