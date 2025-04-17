import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';

@Component({
  selector: 'app-add-menu-item',
  templateUrl: './add-menu-item.page.html',
  styleUrls: ['./add-menu-item.page.scss'],
})
export class AddMenuItemPage implements OnInit {

  menuItemForm!: FormGroup;

  categories: {name: string, id: string}[] = [];


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private notification: NotificationService,
  ) { }

  async ngOnInit() {
    this.populateCategory();
    this.menuItemForm = this.fb.group({
      categoryName: [null, Validators.required],
      subCategoryName: ['', Validators.required],
      items: this.fb.array([this.createItem()])
    });
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


  get itemsFormArray(): FormArray {
    return this.menuItemForm.get('items') as FormArray;
  }

  addItem() {
    this.itemsFormArray.push(this.createItem());
  }

  // Remove an item by index (ensure at least one item remains)
  removeItem(index: number) {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
    }
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

  isFormControlInvalid(controlName: string): boolean {
    const control = this.menuItemForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  isItemControlInvalid(index: number, controlName: string): boolean {
    const control = this.itemsFormArray.at(index).get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onSubmit() {
    if (this.menuItemForm.valid) {

      const categoryName = this.menuItemForm.get('categoryName')?.value;
      const categoryID = this.categories.find(category => category.name === categoryName)?.id;
      if (!categoryID) {
        this.notification.notifyUser('errorSnack', 'Invalid category name');
        return;
      }
      

      const formData = {
          categoryId: categoryID,
          categoryName: this.menuItemForm.get('categoryName')?.value,
          subCategoryName: this.menuItemForm.get('subCategoryName')?.value,
          items: this.menuItemForm.get('items')?.value.map((item: any) => ({
            name: item.name,
            description: item.description,
            price: item.price,
            itemImage: item.itemImage,
          })),
      }


      this.apiService.addRestaurantMenu(formData).subscribe(
        (data: any) => {
          if(data){
            this.notification.notifyUser('successSnack', 'Item added successfully');
            this.router.navigate(['vendor-dashboard/manage']);
          }
        },
        (err: any) => {
          this.notification.notifyUser('errorSnack', err.error.message);
          console.log(err);
        },
      )
    }
  }

  resetForm(){
    this.menuItemForm.reset();
    // Reinitialize with one item
    while (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(0);
    }
  }
}
