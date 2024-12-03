import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  processLogin(userName: string, password: string) {
    const reqPayload = { userName: userName, password: password };
    this.apiService.login(reqPayload).subscribe(
      (response: any) => {
        if(response){
          localStorage.setItem('token', response.token);
        }
        console.log("Token not found, Please contact admin");
      },
      error => {
        console.log("Something went wrong while login. ", error.message);
      }
    )

  }

  logout(){
    localStorage.removeItem('token');
    this.router.navigate(['/public/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    // Return True or False based on check.
    return !!localStorage.getItem('token');
  }


}
