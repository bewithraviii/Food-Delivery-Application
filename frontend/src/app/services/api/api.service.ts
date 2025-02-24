import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { addNewAddressRequest, addToCartReqForm, addToFavorite, applyCouponReqForm, deleteAddressRequest, editAddressRequest, loginRequest, OrderDataModal, otpSendRequest, otpVerifyRequest, qrOtpVerifyRequest, removeCouponReqForm, UpdateOrderModal, updateUserProfileRequest, userSignUpReqForm, vendorLoginRequest, vendorSignUpReqForm } from 'src/app/models/api.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseURL = environment.baseApiUrl;
  private openStreetMapURL = environment.openStreetMapUrl;
  private openRouteServices = environment.openRouteServices;
  private openRouteGeocode = environment.openRouteGeocode;

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
  // Distance
  getAddressLatAndLong(address: string): Observable<any> {
    return this.http.get(`${this.openRouteGeocode}&text=${encodeURIComponent(address)}`);
  }
  getDistanceTrackTime(restaurantAddress: any, destinationAddress: any): Observable<any> {
    return this.http.get(`${this.openRouteServices}&start=${restaurantAddress}&end=${destinationAddress}&radiuses=1000`);
  }

  
  // Common API
  getUserDetails(): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/fetchUserDetails`);
  }


  // Home-Page
  getAllRestaurantDetails(): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/fetchRestaurantDetails`);
  }
  getAllCategories(): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/getAllCuisineCategoryDetails`);
  }


  // Profile-Page
  updateProfileData(reqPayload: updateUserProfileRequest): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/updateUserProfileData`, reqPayload);
  }
  addNewAddress(reqPayload: addNewAddressRequest): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/addNewUserAddress`, reqPayload);
  }
  deleteAddress(reqPayload: deleteAddressRequest): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/deleteUserAddress`, reqPayload);
  }
  updateAddress(reqPayload: editAddressRequest): Observable<any> { 
    return this.http.post(`${this.baseURL}/auth/updateUserAddress`, reqPayload);
  }
  getAllOrderDetails(): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/fetchOrderDetails`);
  }

  // Restaurant-Page
  getRestaurantDetails(reqPayload: string): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/getRestaurantDetails/${reqPayload}`);
  }
  addToFavorite(reqPayload: addToFavorite): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/addToFavorite`, reqPayload);
  }
  
  // Cart-Page
  addToCart(reqPayload: addToCartReqForm): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/addToCart`, reqPayload);
  }
  getUserCartData(reqPayload: string): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/getCartByUserId/${reqPayload}`);
  }
  getUserCartDataForCheckout(reqPayload: string): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/getCartByUserIdForCheckout/${reqPayload}`);
  }
  removeFromCart(reqPayload: addToCartReqForm): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/removeFromCart`, reqPayload);
  }
  getRestaurantDeals(reqPayload: string | undefined): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/getDealsForRestaurant/${reqPayload}`);
  }
  applyCoupon(reqPayload: applyCouponReqForm): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/applyDealsToCart`, reqPayload);
  }
  removeCoupon(reqPayload: removeCouponReqForm): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/removeDealsFromCart`, reqPayload);
  }

  // Check-out Page
  getDealInformation(reqPayload: string): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/getDealInfo/${reqPayload}`);
  }

  // Search Page
  searchRestaurants(query: string): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/searchRestaurant?query=${encodeURIComponent(query)}`);
  }


  // track-Order Page
  getOrderDetails(orderId: string): Observable<any> {
    return this.http.get(`${this.baseURL}/auth/getOrderDetails/${orderId}`);
  }
  addNewOrder(reqPayload: OrderDataModal): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/addNewOrder`, reqPayload);
  }
  updateOrderStatus(reqPayload: UpdateOrderModal): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/updateOrderStatus`, reqPayload);
  }



}
