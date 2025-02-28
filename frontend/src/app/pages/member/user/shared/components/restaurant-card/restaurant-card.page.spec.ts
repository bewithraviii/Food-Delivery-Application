import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestaurantCardPage } from './restaurant-card.page';

describe('RestaurantCardPage', () => {
  let component: RestaurantCardPage;
  let fixture: ComponentFixture<RestaurantCardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
