import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserDashboardPage } from './user-dashboard.page';
import { HomePage } from '../home/home.page';
import { CartPage } from '../cart/cart.page';

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
      // { path: 'search', component: HomePageComponent },
      // { path: 'user', component: HomePageComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserDashboardPageRoutingModule {}
