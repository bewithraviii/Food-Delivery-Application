import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { AddressExtractionService } from 'src/app/services/util/address-extraction.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  searchQuery: string = '';
  restaurants: any[] = [];
  dataProcessing: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private addressExtractionService: AddressExtractionService,
  ) { }

  ngOnInit() {
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.dataProcessing = true;
      this.apiService.searchRestaurants(this.searchQuery).subscribe(
        (data) => {
          if(data){
            this.restaurants = [];
            data.payload.forEach((details: any) => { 
              const extractedAddress = this.addressExtractionService.extractAddressDetails(details.address);
              details.address = extractedAddress;
              this.restaurants.push(details);
            });
          }
          this.dataProcessing = false;
        },
        (error) => {
          console.error('Error searching restaurants:', error);
          this.dataProcessing = false;

        }
      );
    }
  }

  async restaurantDetails(restaurantId: string){
    this.router.navigate(["/user-dashboard/restaurant", restaurantId]);
  }

}
