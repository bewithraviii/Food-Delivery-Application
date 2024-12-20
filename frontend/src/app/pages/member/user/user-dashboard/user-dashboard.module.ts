import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
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
import { SearchPage } from '../search/search.page';
import { ProfilePage } from '../profile/profile.page';
import {MatDividerModule} from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserDashboardPageRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule
  ],
  declarations: [
    UserDashboardPage,
    NavbarPage,
    TabsPage,
    HomePage,
    CartPage,
    SearchPage,
    ProfilePage
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserDashboardPageModule {}
