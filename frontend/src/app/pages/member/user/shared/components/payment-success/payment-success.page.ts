import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.page.html',
  styleUrls: ['./payment-success.page.scss'],
})
export class PaymentSuccessPage implements OnInit, OnDestroy {
  animationDuration: number = 5000;
  showVideo: boolean = false;
  showConfirmationMessage: boolean = false;
  private subscription: Subscription = new Subscription();
  @Input() orderId!: string;

  constructor(private navController: NavController) {}

  ngOnInit() {
    this.showVideo = true;

    this.subscription.add(
      interval(this.animationDuration).subscribe(() => {
        this.navController.navigateRoot(`/user-dashboard/track-order/${this.orderId}`);
        this.showVideo = false;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
