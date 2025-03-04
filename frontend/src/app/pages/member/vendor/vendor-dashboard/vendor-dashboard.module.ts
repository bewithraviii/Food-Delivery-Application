import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VendorDashboardPageRoutingModule } from './vendor-dashboard-routing.module';

import { VendorDashboardPage } from './vendor-dashboard.page';
import { FoodPage } from '../food/food.page';
import { ManagePage } from '../manage/manage.page';
import { NotificationPage } from '../notification/notification.page';
import { DashboardPage } from '../dashboard/dashboard.page';
import { ProfilePage } from '../profile/profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VendorDashboardPageRoutingModule
  ],
  declarations: [
    VendorDashboardPage,
    FoodPage,
    ManagePage,
    ProfilePage,
    DashboardPage,
    NotificationPage
  ]
})
export class VendorDashboardPageModule {}
