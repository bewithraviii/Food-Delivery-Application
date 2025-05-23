import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api/api.service';
import { loginRequest, userSignUpReqForm, vendorLoginRequest, vendorSignUpReqForm } from '../../models/api.interface'
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userData = new BehaviorSubject<any>(null);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  setUser(data: any) {
    this.userData.next(data);
  }


  // Used when we want to get updated userData when user data keep changing
  // getUser() {
  //   return this.userData.asObservable();
  // }

  // User to get the current userData (non-observable)
  getCurrentUser() {
    return this.userData.getValue();
  }

  fetchUserDetails() {
    this.apiService.getUserDetails().subscribe(
      (user) => {
        this.setUser(user.payload);
      },
      (error: any) => {
        console.log('Something went wrong while fetching user-details', error);
        this.setUser(null);
      }    
    );
  }

  processLogin(reqPayload: loginRequest): Observable<any> {
    return this.apiService.login(reqPayload).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.fetchUserDetails();
      })
    );
  }

  processVendorLogin(reqPayload: vendorLoginRequest): Observable<any> {
    return this.apiService.vendorLogin(reqPayload).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      })
    );
  }
  
  processUserRegistration(reqPayload: userSignUpReqForm): Observable<any> {
    return this.apiService.userSignUp(reqPayload).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.fetchUserDetails();
      })
    );
  }  

  processVendorRegistration(reqPayload: vendorSignUpReqForm): Observable<any> {
    return this.apiService.vendorSignUp(reqPayload).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      }),
    );
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('savedAddresses');
    this.setUser(null);
    this.router.navigate(['/public/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded.role || null;
  }

  hasRole(expectedRoles: string[]): boolean {
    const userRole = this.getRole();
    return userRole ? expectedRoles.includes(userRole) : false;
  }

  isLoggedIn() {
    // Return True or False based on check.
    return !!localStorage.getItem('token');
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded.id || null;
  }


}
