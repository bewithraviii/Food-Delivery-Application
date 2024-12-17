import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.page.html',
  styleUrls: ['./navbar.page.scss'],
})
export class NavbarPage implements OnInit {

  logo: string = 'assets/svg/logo.svg';

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
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

}
