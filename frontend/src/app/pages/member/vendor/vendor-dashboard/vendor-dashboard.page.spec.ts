import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VendorDashboardPage } from './vendor-dashboard.page';

describe('VendorDashboardPage', () => {
  let component: VendorDashboardPage;
  let fixture: ComponentFixture<VendorDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
