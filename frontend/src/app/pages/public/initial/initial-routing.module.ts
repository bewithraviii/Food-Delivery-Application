import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InitialPage } from './initial.page';
import { LoginPage } from '../login/login.page';
import { VendorLoginPage } from '../vendor-login/vendor-login.page';
import { SignUpPage } from '../sign-up/sign-up.page';

const routes: Routes = [
  {
  path: '',
  component: InitialPage,
  children: [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginPage },
    { path: 'vendor-login', component: VendorLoginPage },
    { path: 'sign-up', component: SignUpPage },
  ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InitialPageRoutingModule {}
