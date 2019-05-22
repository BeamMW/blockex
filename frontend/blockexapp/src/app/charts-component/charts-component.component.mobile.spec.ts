import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsComponentDesktop } from './charts-component.component.desktop';

describe('ChartsComponentMobile', () => {
  let component: ChartsComponentMobile;
  let fixture: ComponentFixture<ChartsComponentMobile>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartsComponentMobile ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartsComponentMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
