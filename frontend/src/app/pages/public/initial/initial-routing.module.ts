import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InitialPage } from './initial.page';
import { LoginPage } from '../login/login.page';
import { ForgotPasswordPage } from '../forgot-password/forgot-password.page';

const routes: Routes = [
  {
  path: '',
  component: InitialPage,
  children: [
    {
      path: '',
      redirectTo: 'login',
      pathMatch: 'full'
    },
    {
      path: 'login',
      component: LoginPage, // Define the login path here
    },
    {
      path: 'forgot-password',
      component: ForgotPasswordPage, // Define the forgot-password path here
    },
  ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InitialPageRoutingModule {}
