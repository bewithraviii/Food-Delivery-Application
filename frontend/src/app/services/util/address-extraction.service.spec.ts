import { TestBed } from '@angular/core/testing';

import { AddressExtractionService } from './address-extraction.service';

describe('AddressExtractionService', () => {
  let service: AddressExtractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddressExtractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
