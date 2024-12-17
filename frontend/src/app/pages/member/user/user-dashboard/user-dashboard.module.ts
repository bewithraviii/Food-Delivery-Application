import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserDashboardPageRoutingModule } from './user-dashboard-routing.module';

import { UserDashboardPage } from './user-dashboard.page';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HomePage } from '../home/home.page';
import { MatInputModule } from '@angular/material/input';
import { NavbarPage } from '../shared/navbar/navbar.page';
import { TabsPage } from '../shared/tabs/tabs.page';
import { CartPage } from '../cart/cart.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserDashboardPageRoutingModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  declarations: [
    UserDashboardPage,
    NavbarPage,
    TabsPage,
    HomePage,
    CartPage,
  ]
})
export class UserDashboardPageModule {}
