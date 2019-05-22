import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkControlComponent } from './network-control/network-control.component';

import {
  MatSelectModule,
  MatToolbarModule,
  MatInputModule,
} from '@angular/material';
import { HeaderComponentDesktop } from './header/header.component.desktop';
import { HeaderComponentMobile } from "./header/header.component.mobile";

@NgModule({
  imports: [
    CommonModule,
    MatSelectModule,
    MatToolbarModule,
    MatInputModule
  ],
  declarations: [
    NetworkControlComponent,
    HeaderComponentDesktop,
    HeaderComponentMobile
  ],
  entryComponents: [
    HeaderComponentMobile
  ],
  exports: [
    NetworkControlComponent,
    HeaderComponentDesktop,
    HeaderComponentMobile,
  ]
})
export class SharedModule { }
