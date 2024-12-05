import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api/api.service';
import { loginRequest } from '../../models/api.interface'
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  processLogin(reqPayload: loginRequest): Observable<any> {
    return this.apiService.login(reqPayload).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      })
    );
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
