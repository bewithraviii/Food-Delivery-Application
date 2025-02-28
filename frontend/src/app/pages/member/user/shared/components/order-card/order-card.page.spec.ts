import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderCardPage } from './order-card.page';

describe('OrderCardPage', () => {
  let component: OrderCardPage;
  let fixture: ComponentFixture<OrderCardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
