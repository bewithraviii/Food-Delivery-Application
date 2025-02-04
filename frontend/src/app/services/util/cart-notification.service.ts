import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartNotificationService {

  private cartItems = new BehaviorSubject<number>(0);
  cartItems$ = this.cartItems.asObservable();

  constructor() {}

  
  addItemToCart() {
    const currentCount = this.cartItems.value;
    this.cartItems.next(currentCount + 1);
  }


  removeItemFromCart() {
    const currentCount = this.cartItems.value;
    if (currentCount > 0) {
      this.cartItems.next(currentCount - 1);
    }
  }

 
  clearCart() {
    this.cartItems.next(0);
  }


  setCartCount(count: number) {
    this.cartItems.next(count);
  }
}
