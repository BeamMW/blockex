import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockListComponentDesktop } from './block-list.component.desktop';

describe('BlockListComponentDesktop', () => {
  let component: BlockListComponentDesktop;
  let fixture: ComponentFixture<BlockListComponentDesktop>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockListComponentDesktop ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockListComponentDesktop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
