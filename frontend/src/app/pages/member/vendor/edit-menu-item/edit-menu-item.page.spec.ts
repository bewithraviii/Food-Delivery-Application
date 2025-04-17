import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditMenuItemPage } from './edit-menu-item.page';

describe('EditMenuItemPage', () => {
  let component: EditMenuItemPage;
  let fixture: ComponentFixture<EditMenuItemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMenuItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
