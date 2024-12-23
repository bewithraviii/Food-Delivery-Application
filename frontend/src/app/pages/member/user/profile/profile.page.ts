import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
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
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private loadingController: LoadingController,
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

  editUser() {
    alert('Edit User Profile');
  }

  userLogout() {
    this.authService.logout();
  }

  addNewAddress() {

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
