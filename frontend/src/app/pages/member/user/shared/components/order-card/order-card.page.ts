import { formatDate } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ORDER_STATUS } from 'src/app/enums/enum';
import { AddressExtractionService } from 'src/app/services/util/address-extraction.service';

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.page.html',
  styleUrls: ['./order-card.page.scss'],
})
export class OrderCardPage implements OnInit {

  @Input() orderDetail!: any;
  formattedDate: any;
  formattedTime: any;


  constructor(
    private router: Router
  ) { }

  async ngOnInit() {
    await this.updateOrderStatus(this.orderDetail.status);
    await this.formateDateAndTime(this.orderDetail.createdDate);
  }

  async formateDateAndTime(date: any) {
    const dateJSON = new Date(date);
    this.formattedDate = formatDate(dateJSON, 'dd MMM yyyy', 'en-US');
    this.formattedTime = formatDate(dateJSON, 'HH:mm', 'en-US');
  }

  async updateOrderStatus(orderStatus: string) {
    switch (orderStatus) {
      case ORDER_STATUS.CONFIRMED:
        this.orderDetail.status = ORDER_STATUS.CONFIRMED;
        break;
      case ORDER_STATUS.CANCELLED:
        this.orderDetail.status = ORDER_STATUS.CANCELLED;
        break;
      case ORDER_STATUS.COMPLETED:
        this.orderDetail.status = ORDER_STATUS.COMPLETED
        break;
      default:
        this.orderDetail.status = ORDER_STATUS.LIVE
        break;
    }
  }

  redirectToOrderDetail(orderId: string) {
    this.router.navigate([`/user-dashboard/order/${orderId}`]);
  }

  navigateToRestaurant(restaurantId: string) {
    this.router.navigate([`user-dashboard/restaurant/${restaurantId}`]);
  }
}
