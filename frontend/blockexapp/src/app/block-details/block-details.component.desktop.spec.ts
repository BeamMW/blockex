import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockDetailsComponentDesktop } from './block-details.component.desktop';

describe('BlockDetailsComponentDesktop', () => {
  let component: BlockDetailsComponentDesktop;
  let fixture: ComponentFixture<BlockDetailsComponentDesktop>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockDetailsComponentDesktop ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockDetailsComponentDesktop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
