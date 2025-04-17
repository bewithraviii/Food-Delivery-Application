import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderRequestManagementPage } from './order-request-management.page';

describe('OrderRequestManagementPage', () => {
  let component: OrderRequestManagementPage;
  let fixture: ComponentFixture<OrderRequestManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderRequestManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
