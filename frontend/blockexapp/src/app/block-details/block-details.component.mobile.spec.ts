import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockDetailsComponentMobile } from './block-details.component.mobile';

describe('BlockDetailsComponentMobile', () => {
  let component: BlockDetailsComponentMobile;
  let fixture: ComponentFixture<BlockDetailsComponentMobile>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockDetailsComponentMobile ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockDetailsComponentMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
