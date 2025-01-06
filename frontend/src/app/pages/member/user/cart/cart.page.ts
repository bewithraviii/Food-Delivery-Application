import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {

  isDesktop: boolean = true;
  addresses = [
    { title: 'Home', details: 'A-701 Avalon-60, Motera, Gujarat' },
    { title: 'Work', details: 'Tatvasoft house, PRL Colony, Gujarat' },
    { title: 'Friends And Family', details: 'M-7, Nirnay Nagar, Gujarat' }
  ];
  restaurantName = "La Pino'z Pizza";
  orderItem = { name: 'Pesto & Basil Special Pizza', price: '₹414' };
  billDetails = [
    { label: 'Item Total', amount: '₹414' },
    { label: 'Delivery Fee', amount: '₹41' },
    { label: 'GST', amount: '₹48.57' },
  ];
  totalAmount = '₹513';

  constructor() { }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
  }

}
