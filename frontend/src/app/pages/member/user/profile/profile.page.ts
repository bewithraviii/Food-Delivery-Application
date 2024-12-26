import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoadingController, ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DialogPage } from '../shared/dialog/dialog.page';
import { Validators } from '@angular/forms';
import { updateUserProfileRequest } from 'src/app/models/api.interface';

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

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private matDialog: MatDialog,
    // private dialogService: DialogService,
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
            const { title, details, _id } = address;
            this.addresses.push({ title, details, _id });
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

  async openDialog(title: string, contentTemplate: any, contextData: any, fields: any, isConfirmationDialog?: boolean) {
      const dialogRef = this.matDialog.open(DialogPage, {
        data: { title, contentTemplate, fields, contextData, isConfirmationDialog },
        width: '500px',
      });
      return dialogRef.afterClosed().toPromise();
  }


  async editUser() {
    const userInfo = {...this.user};
    const fields = [
      { name: 'name', label: 'Name', type: 'text', value: this.user.name, validators: [Validators.required] },
      { name: 'email', label: 'Email',type: 'text', value: this.user.email, validators: [Validators.required, Validators.email] },
      { name: 'phone', label: 'Phone Number', type: 'tel', value: this.user.phoneNumber , validators: [Validators.required, Validators.pattern(/^[0-9]{10}$/)] },
    ];
    const updatedUser = await this.openDialog(
      'Edit Profile',
      this.editProfileTemplate,
      { user: userInfo },
      fields,
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
    console.log('Add Edit Address');
    const fields = [
      { name: 'title', label: 'Title', value: '', options: ['Home', 'Work', 'Other'], validators: [Validators.required] },
      { name: 'details', label: 'Details', type: 'text', value: '', validators: [Validators.required] },
    ];
    const addAddress = { title: '', details: '' }
    const addedAddress = await this.openDialog(
      "Add Address",
      this.addAddressTemplate,
      { newAddress: addAddress },
      fields
    );

    if(addedAddress){
      console.log(addedAddress);
    }
  }

  async deleteAddress(address: any) {
    console.log("Address to delete",address);
    const message = "Are you sure? This action will permanently remove this address from your profile.";
    const result = await this.openDialog("Delete Address", null, { message: message }, [], true);
    if(result){
      console.log('User want to delete Address', result);
      console.log('User want to delete Address', address);
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
