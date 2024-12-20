import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  profileIcon = 'assets/icons/personal-profile.png';
  isDesktop: boolean = true;
  selectedMenu: string = 'orders';

  user = {
    name: 'Ravi Patel',
    phoneNumber: '8469563711',
    email: 'ravipateljigneshpatel137@gmail.com',
  };

  addresses = [
    {
      title: 'Home',
      details: 'A-701 AVALON-60, Opposite Sangath Pearl, Near Maniilal Party Plot, Motera, Ahmedabad, Gujarat 380005, India',
    },
    {
      title: 'Work',
      details: 'Tatvasoft house, PRL Colony, Thaltej, Ahmedabad, Gujarat, India',
    },
    {
      title: 'Others',
      details: 'M-7, Nirnay Nagar Sector VIII, Nirnay Nagar, Ahmedabad, Gujarat 380081, India',
    },
  ];

  menuItems = [
    { id: 'orders', title: 'Orders', icon: 'bi bi-bag' },
    { id: 'addresses', title: 'Addresses', icon: 'bi bi-geo-alt' },
    { id: 'favorites', title: 'Favorites', icon: 'bi bi-heart' },
    { id: 'payments', title: 'Payments', icon: 'bi bi-credit-card' },
    { id: 'settings', title: 'Settings', icon: 'bi bi-gear' },
    { id: 'logout', title: 'Logout', icon: 'bi bi-box-arrow-right' },
  ];
  constructor() { }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
  }

  selectMenu(menuId: string): void {
    this.selectedMenu = menuId;
  }

  editUser(): void {
    alert('Edit User Profile');
  }

}
