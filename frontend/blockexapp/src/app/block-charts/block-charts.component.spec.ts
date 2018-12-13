import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockChartsComponent } from './block-charts.component';

describe('BlockChartsComponent', () => {
  let component: BlockChartsComponent;
  let fixture: ComponentFixture<BlockChartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
