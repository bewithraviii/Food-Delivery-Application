import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { VendorDashboardPageRoutingModule } from './vendor-dashboard-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { VendorDashboardPage } from './vendor-dashboard.page';
import { FoodPage } from '../food/food.page';
import { ManagePage } from '../manage/manage.page';
import { NotificationPage } from '../notification/notification.page';
import { ProfilePage } from '../profile/profile.page';
import { ConsolePage } from '../console/console.page';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgChartsModule,
    MatDividerModule,
    VendorDashboardPageRoutingModule
  ],
  declarations: [
    VendorDashboardPage,
    FoodPage,
    ManagePage,
    ProfilePage,
    ConsolePage,
    NotificationPage
  ]
})
export class VendorDashboardPageModule {}
