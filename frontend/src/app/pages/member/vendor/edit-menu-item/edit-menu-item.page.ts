import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { menuItemEdit, menuUpdateModal } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';


@Component({
  selector: 'app-edit-menu-item',
  templateUrl: './edit-menu-item.page.html',
  styleUrls: ['./edit-menu-item.page.scss'],
})
export class EditMenuItemPage implements OnInit {

  menuItemForm!: FormGroup;
  categories: {name: string, id: string}[] = [];
  itemData: any;
  itemId: any;
  subCategory: any;
  restaurantId: string = '';
  

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private loadingController: LoadingController,
  ) { }

  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.itemId = params.get('id');
      this.subCategory = this.route.snapshot.params['subCategory'];
    });
    this.populateCategory();
    this.initializeForm();
    await this.populateData(this.itemId, this.subCategory);
  }

  initializeForm(){
    this.menuItemForm = this.fb.group({
      categoryName: [{ value: '', disabled: true }],
      subCategoryName: [{ value: '', disabled: true }],
      items: this.fb.array([this.createItem()])
    });
  }

  get itemsFormArray(): FormArray {
    return this.menuItemForm.get('items') as FormArray;
  }

  populateCategory(){
    this.apiService.getCategoriesData().subscribe(
      (data: any) => {
        data.payload.forEach((element: any) => {
          this.categories.push({ name: element.categoryName, id: element._id });
        });
      },
      (err: any) => {
        console.log(err);
      }
    )
  }

  createItem(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      itemImage: [null],
    });
  }

  async onSubmit() {
    if (this.menuItemForm.valid) {
      await this.presentLoader("Updating...");

      const UpdatePayload = { ...this.menuItemForm.getRawValue() };

      const item = {
        ...UpdatePayload.items[0],
        itemId: +this.itemId
      }
  
      const requestPayload: menuUpdateModal = {
        subCategoryName: UpdatePayload.subCategoryName,
        restaurantId: this.restaurantId,
        items: [item],
      }
  
      try{
          const response: any = await firstValueFrom(this.apiService.editRestaurantMenu(requestPayload));
          if (response && response.payload) {
            this.notification.notifyUser('successSnack', 'Item updated successfully');
            this.router.navigate(['vendor-dashboard/manage']);
          }
          this.dismissLoader();
      }catch(error: any){
        console.error('Error updating availability:', error);
        this.dismissLoader();
        this.notification.notifyUser('errorSnack', error.error.message);
      }
    }
  }

  // Check if a top-level form control is invalid and touched/dirty
  isFormControlInvalid(controlName: string): boolean {
    const control = this.menuItemForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  // Check if an item control (within the items FormArray) is invalid and touched/dirty
  isItemControlInvalid(index: number, controlName: string): boolean {
    const control = this.itemsFormArray.at(index).get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onFileChange(event: any, index: number) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.notification.notifyUser('errorSnack', 'Only JPG, PNG, and JPEG formats are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.itemsFormArray.at(index).patchValue({ itemImage: base64String });
      };
      reader.readAsDataURL(file);
    }
  }

  async populateData(itemId: number, subCategory: any) {
    const requestPayload: menuItemEdit = {
      itemId: itemId,
      subCategoryName: subCategory
    }

    try{
      const response: any = await firstValueFrom(this.apiService.getMenuItemDetails(requestPayload));
      if(response){
        if(response.payload){
          this.itemData = response.payload;
          this.populateForm(this.itemData);
        }
      } else {
        this.notification.notifyUser('errorSnack', 'Something went wrong');
      }
    } catch(err: any){
      console.log(err)
    }

  }

  populateForm(data: any) {

    this.menuItemForm.get('categoryName')?.enable();

    this.menuItemForm.patchValue({
      categoryName: data.category || '',
      subCategoryName: data.subCategoryName || ''
    });

    this.menuItemForm.get('categoryName')?.disable();
    this.menuItemForm.get('subCategoryName')?.disable();
  
    const itemsArray = this.menuItemForm.get('items') as FormArray;
    while (itemsArray.length) {
      itemsArray.removeAt(0);
    }
  
    itemsArray.push(
      this.fb.group({
        name: [data.menuItemDetails.name, Validators.required],
        description: [data.menuItemDetails.description, Validators.required],
        price: [data.menuItemDetails.price, [Validators.required, Validators.min(0)]],
        itemImage: [data.menuItemDetails.itemImage]
      })
    );

    this.restaurantId = data.restaurantId;
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


}
