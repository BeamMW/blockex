import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponentMobile } from './header.component.mobile';

describe('HeaderComponentMobile', () => {
  let component: HeaderComponentMobile;
  let fixture: ComponentFixture<HeaderComponentMobile>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponentMobile ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponentMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
