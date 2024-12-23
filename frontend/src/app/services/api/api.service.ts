import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { loginRequest, otpSendRequest, otpVerifyRequest, qrOtpVerifyRequest, userSignUpReqForm, vendorLoginRequest, vendorSignUpReqForm } from 'src/app/models/api.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseURL = environment.baseApiUrl;
  private openStreetMapURL = environment.openStreetMapUrl;

  constructor(
    private http: HttpClient,
  ) { }



  // Login
  login(reqPayload: loginRequest): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/login`, reqPayload); 
  }
  vendorLogin(reqPayload: vendorLoginRequest): Observable<any>{
    return this.http.post(`${this.baseURL}/auth/vendorLogin`, reqPayload);
  }



  // Sign-Up
  userSignUp(reqPayload: userSignUpReqForm): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/registerUser`, reqPayload);
  }
  vendorSignUp(reqPayload: vendorSignUpReqForm): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/registerVendor`, reqPayload);
  }



  // OTP
  sendOTP(reqPayload: otpSendRequest): Observable<any>{
    return this.http.post(`${this.baseURL}/auth/sendOtp`, reqPayload);
  }
  verifyOTP(reqPayload: otpVerifyRequest): Observable<any>{
    return this.http.post(`${this.baseURL}/auth/verifyOtp`, reqPayload);
  }



  // QR
  generateQRCode(reqPayload: vendorLoginRequest): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/generateQrCode`, reqPayload);
  }
  verifyQrCodeOtp(reqPayload: qrOtpVerifyRequest): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/verifyQrCodeOtp`, reqPayload);
  }


  // Location
  getLocationFromLatAndLong(lat: number, lng: number): Observable<any> {
    return this.http.get(`${this.openStreetMapURL}/reverse?format=json&lat=${lat}&lon=${lng}`)
  }

  //
  getUserDetails(): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/fetchUserDetails`);
  }


}
