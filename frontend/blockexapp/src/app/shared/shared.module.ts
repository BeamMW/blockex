import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkControlComponent } from './network-control/network-control.component';

import {
  MatSelectModule,
} from '@angular/material';
@NgModule({
  imports: [
    CommonModule,
    MatSelectModule
  ],
  declarations: [NetworkControlComponent],
  exports:      [NetworkControlComponent]
})
export class SharedModule { }
