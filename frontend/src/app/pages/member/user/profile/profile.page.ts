import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoadingController, ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DialogPage } from '../shared/dialog/dialog.page';

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
    await this.presentLoader();
    this.apiService.getUserDetails().subscribe((fetchedData: any) => {
        const data = fetchedData.payload;
        if(data){
          this.user.name = data.name;
          this.user.phoneNumber = data.phoneNumber;
          this.user.email = data.email;
          data.address.forEach((address: any) => {
            const { title, details } = address;
            this.addresses.push({ title, details });
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

  async openDialog(title: string, contentTemplate: any, contextData: any) {
      const dialogRef = this.matDialog.open(DialogPage, {
        data: { title, contentTemplate, contextData },
        width: '500px',
      });
      return dialogRef.afterClosed().toPromise();
  }


  async editUser() {
    const userInfo = {...this.user};
    const updatedUser = await this.openDialog(
      'Edit Profile',
      this.editProfileTemplate,
      { user: userInfo }
    );

    if(updatedUser) {
      console.log(updatedUser);
      // this.apiService.updateUserDetails(updatedUser).subscribe(
      //   (response: any) => {
      //     console.log('User details updated successfully', response);
      //     this.user = { ...updatedUser };
      //   },
      //   (error: any) => {
      //     console.error('Error updating user details', error);
      //   }
      // );
    }
  }

  async addNewAddress() {
    console.log('Add Edit Address');
    const addAddress = {title: '', details: ''}
    const address = await this.openDialog('Add Address', this.addAddressTemplate, {address: addAddress});
    if(address){
      console.log(address);
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
