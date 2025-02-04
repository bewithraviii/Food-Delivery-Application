import { TestBed } from '@angular/core/testing';

import { CartNotificationService } from './cart-notification.service';

describe('CartNotificationService', () => {
  let service: CartNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
