import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { menuItemDelete, menuUpdateModal, updateRestaurantValue } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.page.html',
  styleUrls: ['./manage.page.scss'],
})
export class ManagePage implements OnInit {

  isDesktop: boolean = true;
  restaurantId: string = '';
  restaurantDetails: any = {};
  menuItems: any[] = [];
  cuisineTypes: any[] = [];
  

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.checkScreenSize();
    if(this.isDesktop){
      this.resetState();
      this.loadData();
    }
  }

  ionViewWillEnter() {
    this.resetState();
    this.loadData();
  }

  resetState() {
    this.restaurantId = '';
    this.restaurantDetails = {};
    this.menuItems = [];
    this.cuisineTypes = [];
  }

  async loadData() {
    await this.presentLoader('Loading...');
    await this.fetchRestaurantDetails();
    this.dismissLoader();
  }

  async fetchRestaurantDetails() {
    try {
      const response: any = await firstValueFrom(this.apiService.getRestaurantData());
      if (response && response.payload) {
        this.restaurantDetails = response.payload;
        this.restaurantId = this.restaurantDetails._id;
        this.cuisineTypes = this.restaurantDetails.cuisineTypes || [];
        this.menuItems = this.restaurantDetails.menu || [];
        this.cd.detectChanges();

      }
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
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

  addNewItem() {
    this.router.navigate(['vendor-dashboard/add-menu-item']);
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
  }

  async updateAvailability(eventData: any) {
    await this.presentLoader("Updating...");
    const { item, toUpdatedValue, subCategory } = eventData;
    
    const toUpdatePayload = { ...item };

    for (const key in toUpdatedValue) {
      if (toUpdatedValue.hasOwnProperty(key)) {
        toUpdatePayload[key] = toUpdatedValue[key];
      }
    }

    const requestPayload: menuUpdateModal = {
      subCategoryName: subCategory,
      restaurantId: this.restaurantId,
      items: [toUpdatePayload],
    }

    try{
        const response: any = await firstValueFrom(this.apiService.editRestaurantMenu(requestPayload));
        if (response && response.payload) {
          this.resetState();
          this.restaurantDetails = response.payload;
          this.restaurantId = this.restaurantDetails._id;
          this.cuisineTypes = this.restaurantDetails.cuisineTypes || [];
          this.menuItems = this.restaurantDetails.menu || [];
          this.cd.detectChanges();
        }
        this.dismissLoader();
    }catch(error: any){
        console.error('Error updating availability:', error);
        this.dismissLoader();
    }

  }

  async deleteMenuItem(eventData: any) {
    await this.presentLoader("Deleting...");
    const { itemId, subCategoryName } = eventData;

    const requestPayload: menuItemDelete = {
      subCategoryName: subCategoryName,
      itemId: itemId,
    }

    try{
      const response: any = await firstValueFrom(this.apiService.removeItemFromRestaurantMenu(requestPayload));
      if (response && response.payload) {
        this.resetState();
        this.restaurantDetails = response.payload;
        this.restaurantId = this.restaurantDetails._id;
        this.cuisineTypes = this.restaurantDetails.cuisineTypes || [];
        this.menuItems = this.restaurantDetails.menu || [];
        this.cd.detectChanges();
      }
      this.dismissLoader();
    }catch(error: any){
      console.error('Error while deleting menu item:', error);
      this.dismissLoader();
    }
    
  }

  async toggleGstApplicable(event: any){
    await this.presentLoader("Updating...");
    const toUpdatedValue = {
      gstApplicable: event.checked
    }

    const requestPayload: updateRestaurantValue = {
      restaurantId: this.restaurantId,
      items: toUpdatedValue,
    }


    try{
      const response: any = await firstValueFrom(this.apiService.updateRestaurantData(requestPayload));
      if (response && response.payload) {
        this.resetState();
        this.restaurantDetails = response.payload;
        this.restaurantId = this.restaurantDetails._id;
        this.cuisineTypes = this.restaurantDetails.cuisineTypes || [];
        this.menuItems = this.restaurantDetails.menu || [];
        this.cd.detectChanges();
      }
      this.dismissLoader();
    }catch(error: any){
      console.error('Error updating availability:', error);
      this.dismissLoader();
    }
  }

  async toggleDeliveryFee(event: any){
    await this.presentLoader("Updating...");
    const toUpdatedValue = {
      deliveryFeeApplicable: event.checked
    }

    const requestPayload: updateRestaurantValue = {
      restaurantId: this.restaurantId,
      items: toUpdatedValue,
    }

    try{
      const response: any = await firstValueFrom(this.apiService.updateRestaurantData(requestPayload));
      if (response && response.payload) {
        this.resetState();
        this.restaurantDetails = response.payload;
        this.restaurantId = this.restaurantDetails._id;
        this.cuisineTypes = this.restaurantDetails.cuisineTypes || [];
        this.menuItems = this.restaurantDetails.menu || [];
        this.cd.detectChanges();
      }
      this.dismissLoader();
    }catch(error: any){
      console.error('Error updating availability:', error);
      this.dismissLoader();
    }

  }

}
