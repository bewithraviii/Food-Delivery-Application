import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { OrderRequestManagementPage } from '../order-request-management/order-request-management.page';
import { RevenueManagementPage } from '../revenue-management/revenue-management.page';
import { ReviewManagementPage } from '../review-management/review-management.page';
import { RunningOrderManagementPage } from '../running-order-management/running-order-management.page';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { AddMenuItemPage } from '../add-menu-item/add-menu-item.page';
import { EditMenuItemPage } from '../edit-menu-item/edit-menu-item.page';
import { MenuCardPage } from '../shared/components/menu-card/menu-card.page';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import {
  MatSlideToggleModule,
  _MatSlideToggleRequiredValidatorModule,
} from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NgChartsModule,
    MatDividerModule,
    VendorDashboardPageRoutingModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCardModule,
    _MatSlideToggleRequiredValidatorModule,
  ],
  declarations: [
    VendorDashboardPage,
    FoodPage,
    ManagePage,
    ProfilePage,
    ConsolePage,
    NotificationPage,
    OrderRequestManagementPage,
    RevenueManagementPage,
    ReviewManagementPage,
    RunningOrderManagementPage,
    AddMenuItemPage,
    EditMenuItemPage,
    MenuCardPage
  ]
})
export class VendorDashboardPageModule {}
