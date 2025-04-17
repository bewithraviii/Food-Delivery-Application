import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewManagementPage } from './review-management.page';

describe('ReviewManagementPage', () => {
  let component: ReviewManagementPage;
  let fixture: ComponentFixture<ReviewManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
