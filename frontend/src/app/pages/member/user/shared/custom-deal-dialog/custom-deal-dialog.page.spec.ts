import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomDealDialogPage } from './custom-deal-dialog.page';

describe('CustomDealDialogPage', () => {
  let component: CustomDealDialogPage;
  let fixture: ComponentFixture<CustomDealDialogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDealDialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
