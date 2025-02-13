import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
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
  currentRoute: string = '';

  constructor(
    private router: Router,
    private menu: MenuController,
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
    if (!this.isMobileView) {
      this.menu.close('mobileMenu');
    }
  }

  toggleMenu() {
    this.menu.toggle('mobileMenu');
  }

  closeMenu() {
    this.menu.close('mobileMenu');
  }

}
