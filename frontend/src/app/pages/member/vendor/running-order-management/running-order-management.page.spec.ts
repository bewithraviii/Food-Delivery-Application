import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RunningOrderManagementPage } from './running-order-management.page';

describe('RunningOrderManagementPage', () => {
  let component: RunningOrderManagementPage;
  let fixture: ComponentFixture<RunningOrderManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RunningOrderManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
