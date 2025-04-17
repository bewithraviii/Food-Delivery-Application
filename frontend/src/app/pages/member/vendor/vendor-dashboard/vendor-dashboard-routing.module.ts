import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VendorDashboardPage } from './vendor-dashboard.page';
import { FoodPage } from '../food/food.page';
import { ManagePage } from '../manage/manage.page';

import { NotificationPage } from '../notification/notification.page';
import { ProfilePage } from '../profile/profile.page';
import { ConsolePage } from '../console/console.page';
import { ReviewManagementPage } from '../review-management/review-management.page';
import { RevenueManagementPage } from '../revenue-management/revenue-management.page';
import { OrderRequestManagementPage } from '../order-request-management/order-request-management.page';
import { RunningOrderManagementPage } from '../running-order-management/running-order-management.page';
import { AddMenuItemPage } from '../add-menu-item/add-menu-item.page';
import { EditMenuItemPage } from '../edit-menu-item/edit-menu-item.page';

const routes: Routes = [
  {
    path: '',
    component: VendorDashboardPage,
    children: [
      {
        path: '',
        redirectTo: 'console',
        pathMatch: 'full'
      },
      { path: 'console', component: ConsolePage },
      { path: 'food', component: FoodPage },
      { path: 'profile', component: ProfilePage },
      { path: 'manage', component: ManagePage },
      { path: 'notification', component: NotificationPage },
      { path: 'review-management', component: ReviewManagementPage },
      { path: 'revenue-management', component: RevenueManagementPage },
      { path: 'order-request-management', component: OrderRequestManagementPage },
      { path: 'running-order-management', component: RunningOrderManagementPage },
      { path: 'add-menu-item', component: AddMenuItemPage },
      { path: 'edit-menu-item/:id', component: EditMenuItemPage },
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendorDashboardPageRoutingModule {}
