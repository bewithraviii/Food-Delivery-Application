import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const canAccess = this.authService.isLoggedIn();
    if(canAccess){
      return true;
    }
    else {
      console.log("User not authorized, Please login again.")
      this.navigateToLogin();
      return false;
    }
  }
  
  navigateToLogin() {
    this.router.navigate(['/public/login']);
  }

}
