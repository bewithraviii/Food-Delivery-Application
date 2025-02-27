import { TestBed } from '@angular/core/testing';

import { DeliveryTimeCalculationService } from './delivery-time-calculation.service';

describe('DeliveryTimeCalculationService', () => {
  let service: DeliveryTimeCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryTimeCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
