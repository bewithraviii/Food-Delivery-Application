import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserDashboardPage } from './user-dashboard.page';
import { HomePage } from '../home/home.page';
import { CartPage } from '../cart/cart.page';
import { SearchPage } from '../search/search.page';
import { ProfilePage } from '../profile/profile.page';
import { RestaurantPage } from '../restaurant/restaurant.page';
import { CheckoutPage } from '../checkout/checkout.page';
import { OrderPage } from '../order/order.page';
import { TrackOrderPage } from '../track-order/track-order.page';

const routes: Routes = [
  {
    path: '',
    component: UserDashboardPage,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      { path: 'home', component: HomePage },
      { path: 'cart', component: CartPage },
      { path: 'search', component: SearchPage },
      { path: 'profile', component: ProfilePage },
      { path: 'restaurant/:id', component: RestaurantPage},
      { path: 'checkout', component: CheckoutPage },
      { path: 'order', component: OrderPage },
      { path: 'track-order/:id', component: TrackOrderPage },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserDashboardPageRoutingModule {}
