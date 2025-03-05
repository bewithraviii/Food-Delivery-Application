import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VendorDashboardPage } from './vendor-dashboard.page';
import { FoodPage } from '../food/food.page';
import { ManagePage } from '../manage/manage.page';

import { NotificationPage } from '../notification/notification.page';
import { ProfilePage } from '../profile/profile.page';
import { ConsolePage } from '../console/console.page';

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
      { path: 'notification', component: NotificationPage }
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendorDashboardPageRoutingModule {}
