import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkControlComponent } from './network-control/network-control.component';

import {
  MatSelectModule,
  MatToolbarModule,
  MatInputModule,
} from '@angular/material';
import { HeaderComponentDesktop } from './header/header.component.desktop';
import { HeaderComponentMobile } from './header/header.component.mobile';
import { AssetsHeaderComponent } from './assets-header/assets-header.component';

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
    HeaderComponentMobile,
    AssetsHeaderComponent
  ],
  entryComponents: [
    HeaderComponentMobile
  ],
  exports: [
    NetworkControlComponent,
    HeaderComponentDesktop,
    HeaderComponentMobile,
    AssetsHeaderComponent
  ]
})
export class SharedModule { }
