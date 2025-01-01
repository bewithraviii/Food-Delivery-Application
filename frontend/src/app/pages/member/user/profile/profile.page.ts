import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoadingController, ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DialogPage } from '../shared/dialog/dialog.page';
import { Validators } from '@angular/forms';
import { addNewAddressRequest, deleteAddressRequest, editAddressRequest, updateUserProfileRequest } from 'src/app/models/api.interface';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('editProfileTemplate') editProfileTemplate!: TemplateRef<any>;
  @ViewChild('addAddressTemplate') addAddressTemplate!: TemplateRef<any>;

  profileIcon = 'assets/icons/personal-profile.png';
  isDesktop: boolean = true;
  selectedMenu: string = 'orders';
  user: any = {
    name: '...',
    phoneNumber: '...',
    email: '...',
    id: ''
  };
  addresses: any = [];
  menuItems = [
    { id: 'orders', title: 'Orders', icon: 'bag-check' },
    { id: 'addresses', title: 'Addresses', icon: 'location' },
    { id: 'favorites', title: 'Favorites', icon: 'bookmark' },
    { id: 'payments', title: 'Payments', icon: 'card' },
    { id: 'settings', title: 'Settings', icon: 'settings' },
  ];
  ordersList: any = [];
  favList: any = [];
  paymentCards: any = [
    {
      cardNumber: "8765123498075643",
      cardExpiry: "12/27",
    },
    {
      cardNumber: "8654223498075654",
      cardExpiry: "02/25",
    }
  ];
  settingList: any = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private matDialog: MatDialog,
    private dialogService: DialogService,
  ) { }

  async ngOnInit() {
    await this.presentLoader('Loading Profile...');
    this.apiService.getUserDetails().subscribe((fetchedData: any) => {
        const data = fetchedData.payload;
        if(data){
          this.user.id = data.id,
          this.user.name = data.name;
          this.user.phoneNumber = data.phoneNumber;
          this.user.email = data.email;
          data.address.forEach((address: any) => {
            this.addresses.push(address);
          });
        }
    });

    this.checkScreenSize();
    await this.dismissLoader();
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
  }

  selectMenu(menuId: string): void {
    this.selectedMenu = menuId;
  }

  // async openDialog(title: string, contextData: any, fields: any, contentTemplate?: any, isConfirmationDialog?: boolean) {
  //     const dialogRef = this.matDialog.open(DialogPage, {
  //       data: { title, contentTemplate, fields, contextData, isConfirmationDialog },
  //       width: '500px',
  //     });
  //     return dialogRef.afterClosed().toPromise();
  // }


  async editUser() {
    const userInfo = {...this.user};
    const fields = [
      { name: 'name', label: 'Name', type: 'text', value: this.user.name, validators: [Validators.required] },
      { name: 'email', label: 'Email',type: 'text', value: this.user.email, validators: [Validators.required, Validators.email] },
      { name: 'phone', label: 'Phone Number', type: 'tel', value: this.user.phoneNumber , validators: [Validators.required, Validators.pattern(/^[0-9]{10}$/)] },
    ];
    const updatedUser = await this.dialogService.openDialog(
      'Edit Profile',
      { user: userInfo },
      fields,
      this.editProfileTemplate,
    );

    if(updatedUser) {
      await this.presentLoader('Updating profile...');
      const requestPayload: updateUserProfileRequest = {
        userId: this.user.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phone
      }
      this.apiService.updateProfileData(requestPayload).subscribe(
        (response: any) => {
          this.user = { ...response.payload };
          this.dismissLoader();
        },
        (error: any) => {
          console.error('Error updating user details', error);
          this.dismissLoader();
        }
      );
    }
  }

  async addNewAddress() {
    const fields = [
      { name: 'title', label: 'Title', value: '', options: ['Home', 'Work', 'Other'], validators: [Validators.required] },
      { name: 'details', label: 'Details', type: 'text', value: '', validators: [Validators.required] },
    ];
    const addAddress = { title: '', details: '' }
    const addedAddress = await this.dialogService.openDialog(
      "Add Address",
      { newAddress: addAddress },
      fields,
      this.addAddressTemplate,
    );

    if(addedAddress){
      await this.presentLoader('Adding address...');
      const requestPayload: addNewAddressRequest = {
        userId: this.user.id,
        title: addedAddress.title,
        detail: addedAddress.details,
      }
      this.apiService.addNewAddress(requestPayload).subscribe(
        (response: any) => {
          this.addresses = [];
          response.payload.address.forEach((address: any) => {
            this.addresses.push(address);
          });
          this.dismissLoader();
        },
        (error: any) => {
          console.error('Error adding new address', error);
          this.dismissLoader();
        }
      );
    }
  }

  async editAddress(address: any) {
    const fields = [
      { name: 'title', label: 'Title', value: address.title, options: ['Home', 'Work', 'Other'], validators: [Validators.required] },
      { name: 'details', label: 'Details', type: 'text', value: address.details, validators: [Validators.required] },
    ];
    const editAddress = { title: address.title, details: address.details }
    const editedAddress = await this.dialogService.openDialog(
      "Edit Address",
      { editAddress: editAddress },
      fields,
      this.addAddressTemplate,
    );

    if(editedAddress){
      await this.presentLoader('Updating address...');
      const requestPayload: editAddressRequest = {
        userId: this.user.id,
        title: editedAddress.title,
        detail: editedAddress.details,
        addressId: address._id,
      }
      this.apiService.updateAddress(requestPayload).subscribe(
        (response: any) => {
          this.addresses = [];
          response.payload.address.forEach((address: any) => {
            this.addresses.push(address);
          });
          this.dismissLoader();
        },
        (error: any) => {
          console.error('Error editing user address', error);
          this.dismissLoader();
        }
      )
    }
  }

  async deleteAddress(address: any) {
    const contextData = {
      message: "Are you sure? This action will permanently remove this address from your profile.",
      identity: "confirmation",
    } 
    const result = await this.dialogService.openDialog("Delete Address", contextData, [], null, true);
    if(result){
      await this.presentLoader('Deleting address...');
      const requestPayload: deleteAddressRequest = {
        userId: this.user.id,
        addressId: address._id,
      }
      this.apiService.deleteAddress(requestPayload).subscribe(
        (response: any) => {
          this.addresses = [];
          response.payload.address.forEach((address: any) => {
            this.addresses.push(address);
          });
          this.dismissLoader();
        },
        (error: any) => {
          console.error('Error deleting user address', error);
          this.dismissLoader();
        }
      );
    }
  }

  async addNewPaymentCard() {
    const fields = [
      { name: 'name', label: 'Card Holder Name', type: 'text', value: '', validators: [Validators.required] },
      { name: 'number', label: 'Card Number', type: 'text', value: '', validators: [Validators.required] },
      { name: 'month', label: 'Card Expire Month', type: 'text', value: '', validators: [Validators.required] },
      { name: 'year', label: 'Card Expire Year', type: 'text', value: '', validators: [Validators.required] },
      { name: 'cvc', label: 'Card CVC', type: 'text', value: '', validators: [Validators.required] },
    ];
    const addCard = { name: '', number: '', month: '', year: '', cvc: '' }
    const addedCard = await this.dialogService.openDialog(
      "Add Card",
      { editAddress: addCard },
      fields,
      null,
    );

    if(addedCard){
      console.log(addedCard);
    }
  }
  
  userLogout() {
    this.authService.logout();
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
