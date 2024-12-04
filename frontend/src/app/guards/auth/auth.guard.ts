import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

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
      this.navigateToLogin();
      return false;
    }
  }
  
  navigateToLogin() {
    this.router.navigate(['/public/login']);
  }

}
