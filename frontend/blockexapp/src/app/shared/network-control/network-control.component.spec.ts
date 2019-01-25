import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkControlComponent } from './network-control.component';

describe('NetworkControlComponent', () => {
  let component: NetworkControlComponent;
  let fixture: ComponentFixture<NetworkControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
