import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsHeaderComponent } from './assets-header.component';

describe('AssetsHeaderComponent', () => {
  let component: AssetsHeaderComponent;
  let fixture: ComponentFixture<AssetsHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
