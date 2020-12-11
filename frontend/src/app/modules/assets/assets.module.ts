import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { AssetsRoutingModule } from './assets-routing.module';
import { AssetCreateComponent, AssetDetailsComponent, AssetsListComponent } from './containers';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AssetCreateComponent,
    AssetDetailsComponent,
    AssetsListComponent
  ],
  providers: [],
  imports: [
    SharedModule,
    CommonModule,
    AssetsRoutingModule,
    MatPaginatorModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class AssetsModule { }
