import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';
import { RoleGuard } from './guards/role/role.guard';

const routes: Routes = [
  // { path: '', redirectTo: 'public', pathMatch: 'full'},
  {
    path: '',
    loadChildren: () => import('./pages/public/intro/intro.module').then(m => m.IntroPageModule),
  },
  {
    path: 'public',
    loadChildren: () => import('./pages/public/initial/initial.module').then( m => m.InitialPageModule)
  },
  // {
  //   path: 'dashboard',
  //   canActivate: [AuthGuard],
  //   loadChildren: () => import('./pages/member/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  // },
  {
    path: 'vendor-dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['VENDOR'] },
    loadChildren: () => import('./pages/member/vendor/vendor-dashboard/vendor-dashboard.module').then( m => m.VendorDashboardPageModule)
  },
  {
    path: 'user-dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['USER'] },
    loadChildren: () => import('./pages/member/user/user-dashboard/user-dashboard.module').then( m => m.UserDashboardPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
