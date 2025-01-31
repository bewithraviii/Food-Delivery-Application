import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss'],
})
export class UserDashboardPage implements OnInit {

  isMobileView?: boolean;
  logo: string = 'assets/svg/logo.svg';
  hidden = true;
  currentRoute: string = '';
  cartItems: number = 0;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.checkScreenSize();
    const userID = await this.authService.getUserId() || '';
    this.apiService.getUserCartData(userID).subscribe(
      (data: any) => {
        if(data){
          this.cartItems += 1;
          this.hidden = false;
        }
      },
      (error: any) => { console.log(error.message || 'Nav-Bar cart data error occurred')}
    )
  }

  goToHome(){
    this.router.navigate(['/user-dashboard/home'])
  }

  goToUser(){
    this.router.navigate(['/user-dashboard/user'])
  }

  goToCart(){
    this.router.navigate(['/user-dashboard/cart'])
  }

  goToSearch(){
    this.router.navigate(['/user-dashboard/search'])
  }
  

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
  }
}
