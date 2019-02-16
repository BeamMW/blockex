import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkControlComponent } from './network-control/network-control.component';

import {
  MatSelectModule,
  MatToolbarModule,
  MatInputModule,
} from '@angular/material';
import { HeaderComponent } from './header/header.component';
@NgModule({
  imports: [
    CommonModule,
    MatSelectModule,
    MatToolbarModule,
    MatInputModule
  ],
  declarations: [
    NetworkControlComponent,
    HeaderComponent
  ],
  exports: [
    NetworkControlComponent,
    HeaderComponent
  ]
})
export class SharedModule { }
