import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponentDesktop } from './header.component.desktop';

describe('HeaderComponentDesktop', () => {
  let component: HeaderComponentDesktop;
  let fixture: ComponentFixture<HeaderComponentDesktop>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponentDesktop ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponentDesktop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
