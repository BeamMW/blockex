import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockChartsComponentDesktop } from './block-charts.component.desktop';

describe('BlockChartsComponentDesktop', () => {
  let component: BlockChartsComponentDesktop;
  let fixture: ComponentFixture<BlockChartsComponentDesktop>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockChartsComponentDesktop ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockChartsComponentDesktop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
