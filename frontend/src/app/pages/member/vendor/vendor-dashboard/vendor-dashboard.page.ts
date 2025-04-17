import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendor-dashboard',
  templateUrl: './vendor-dashboard.page.html',
  styleUrls: ['./vendor-dashboard.page.scss'],
})
export class VendorDashboardPage implements OnInit {

  isMobileView?: boolean = false;
  logo: string = 'assets/svg/logo.svg';
  menuToggle: string = 'assets/svg/menu-toggle-btn.svg';

  constructor(
    private router: Router,
  ) { }

  async ngOnInit(): Promise<void>
  {    
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
  }

  goToHome(){
    this.router.navigate(['/vendor-dashboard/console'])
  }

}
