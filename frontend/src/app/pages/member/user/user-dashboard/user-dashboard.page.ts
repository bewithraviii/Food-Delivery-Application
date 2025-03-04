import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartNotificationService } from 'src/app/services/util/cart-notification.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss'],
})
export class UserDashboardPage implements OnInit {

  isMobileView?: boolean = false;
  logo: string = 'assets/svg/logo.svg';
  menuToggle: string = 'assets/svg/menu-toggle-btn.svg';

  constructor(
    private router: Router,
    private cartNotificationService: CartNotificationService
  ) { }

  cartItems = this.cartNotificationService.cartItems;
  hasItemsInCart = this.cartNotificationService.hasItemsInCart;

  async ngOnInit() {
    this.checkScreenSize();
  }

  goToHome(){
    this.router.navigate(['/user-dashboard/home'])
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
  }
}
