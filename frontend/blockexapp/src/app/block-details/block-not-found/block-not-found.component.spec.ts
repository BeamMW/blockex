import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockNotFoundComponent } from './block-not-found.component';

describe('BlockNotFoundComponent', () => {
  let component: BlockNotFoundComponent;
  let fixture: ComponentFixture<BlockNotFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockNotFoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
