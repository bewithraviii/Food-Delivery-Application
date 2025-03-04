import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VendorDashboardPage } from './vendor-dashboard.page';
import { FoodPage } from '../food/food.page';
import { ManagePage } from '../manage/manage.page';

import { NotificationPage } from '../notification/notification.page';
import { DashboardPage } from '../dashboard/dashboard.page';
import { ProfilePage } from '../profile/profile.page';

const routes: Routes = [
  {
    path: '',
    component: VendorDashboardPage,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      { path: 'dashboard', component: DashboardPage },
      { path: 'food', component: FoodPage },
      { path: 'profile', component: ProfilePage },
      { path: 'manage', component: ManagePage },
      { path: 'notification', component: NotificationPage }
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendorDashboardPageRoutingModule {}
