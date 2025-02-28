import { computed, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartNotificationService {

  // Main signal
  private _cartItems = signal<number>(0);

  // Cart item count readonly value to show number in frontend(signal)
  cartItems = this._cartItems.asReadonly();
  
  // Return boolean after checking(signal)
  hasItemsInCart = computed(() => this._cartItems() > 0);

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.initializeCart();
  }

  
  async initializeCart() {
    const userID = await this.authService.getUserId() || '';
    this.apiService.getUserCartDataForCheck(userID)
      .pipe(take(1))
      .subscribe({
        next: (data: any) => {
          if (data.payload) {
            this._cartItems.set(1);
          } else {
            this._cartItems.set(0);
          }
        },
        error: (error: any) => {
          console.error('Cart initialization error:', error.error.message || 'An error occurred');
          this._cartItems.set(0);
        }
      });
  }

  addItemToCart() {
    this._cartItems.update(value => value === 0 ? 1 : value);
  }

  removeItemFromCart() {
    this._cartItems.update(value => Math.max(0, value - 1));
  }

  clearCart() {
    this._cartItems.set(0);
  }

  setCartItemCount(count: number) {
    this._cartItems.set(count);
  }

}
