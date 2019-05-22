import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockListComponentMobile } from './block-list.component.mobile';

describe('BlockListComponentMobile', () => {
  let component: BlockListComponentMobile;
  let fixture: ComponentFixture<BlockListComponentMobile>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockListComponentMobile ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockListComponentMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
