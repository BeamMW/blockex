import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderToggleSwitchComponent } from './header-toggle-switch.component';

describe('HeaderToggleSwitchComponent', () => {
  let component: HeaderToggleSwitchComponent;
  let fixture: ComponentFixture<HeaderToggleSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderToggleSwitchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderToggleSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
