import { TestBed } from '@angular/core/testing';

import { OrderRequestManagementService } from './order-request-management.service';

describe('OrderRequestManagementService', () => {
  let service: OrderRequestManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderRequestManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
