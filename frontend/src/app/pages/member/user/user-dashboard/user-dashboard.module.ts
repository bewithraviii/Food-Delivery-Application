import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserDashboardPageRoutingModule } from './user-dashboard-routing.module';
import { UserDashboardPage } from './user-dashboard.page';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HomePage } from '../home/home.page';
import { MatInputModule } from '@angular/material/input';
import { NavbarPage } from '../shared/navbar/navbar.page';
import { TabsPage } from '../shared/tabs/tabs.page';
import { CartPage } from '../cart/cart.page';
import { SearchPage } from '../search/search.page';
import { ProfilePage } from '../profile/profile.page';
import {MatDividerModule} from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { DialogPage } from '../shared/dialog/dialog.page';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { RestaurantPage } from '../restaurant/restaurant.page';
import { FooterPage } from '../shared/footer/footer.page';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatStepperModule } from '@angular/material/stepper';
import { MatBadgeModule } from '@angular/material/badge';
import { CustomDealDialogPage } from '../shared/custom-deal-dialog/custom-deal-dialog.page';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CheckoutPage } from '../checkout/checkout.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    UserDashboardPageRoutingModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatDialogModule,
    ClipboardModule,
    MatStepperModule,
    MatBadgeModule,
    MatMenuModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  declarations: [
    UserDashboardPage,
    NavbarPage,
    TabsPage,
    FooterPage,
    HomePage,
    DialogPage,
    CustomDealDialogPage,
    CartPage,
    SearchPage,
    ProfilePage,
    RestaurantPage,
    CheckoutPage
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserDashboardPageModule {}
