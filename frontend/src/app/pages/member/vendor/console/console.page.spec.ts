import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsolePage } from './console.page';

describe('ConsolePage', () => {
  let component: ConsolePage;
  let fixture: ComponentFixture<ConsolePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsolePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
