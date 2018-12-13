import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsComponentComponent } from './charts-component.component';

describe('ChartsComponentComponent', () => {
  let component: ChartsComponentComponent;
  let fixture: ComponentFixture<ChartsComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartsComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
