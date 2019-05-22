import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsComponentDesktop } from './charts-component.component.desktop';

describe('ChartsComponent', () => {
  let component: ChartsComponentDesktop;
  let fixture: ComponentFixture<ChartsComponentDesktop>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartsComponentDesktop ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartsComponentDesktop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
