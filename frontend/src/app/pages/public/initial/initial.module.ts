import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InitialPageRoutingModule } from './initial-routing.module';
import { InitialPage } from './initial.page';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoginPage } from '../login/login.page';
import { ForgotPasswordPage } from '../forgot-password/forgot-password.page';
import { SignUpPage } from '../sign-up/sign-up.page';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    InitialPageRoutingModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatListModule,
    MatCardModule,
    MatSelectModule
  ],
  declarations: [
    InitialPage,
    LoginPage,
    ForgotPasswordPage,
    SignUpPage
  ]
})
export class InitialPageModule {}
