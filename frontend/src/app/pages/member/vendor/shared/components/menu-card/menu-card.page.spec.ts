import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuCardPage } from './menu-card.page';

describe('MenuCardPage', () => {
  let component: MenuCardPage;
  let fixture: ComponentFixture<MenuCardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
