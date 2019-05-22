import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockChartsComponentMobile } from './block-charts.component.mobile';

describe('BlockChartsComponentMobile', () => {
  let component: BlockChartsComponentMobile;
  let fixture: ComponentFixture<BlockChartsComponentMobile>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockChartsComponentMobile ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockChartsComponentMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
