import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevenueManagementPage } from './revenue-management.page';

describe('RevenueManagementPage', () => {
  let component: RevenueManagementPage;
  let fixture: ComponentFixture<RevenueManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenueManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
