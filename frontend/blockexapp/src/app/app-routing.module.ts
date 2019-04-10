import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlockDetailsComponent } from './block-details/block-details.component'
import { BlockNotFoundComponent } from './block-details/block-not-found/block-not-found.component'
import { BlockListComponent } from './block-list/block-list.component'
import { BlockChartsComponent } from './block-charts/block-charts.component'

const routes: Routes = [
  {path: '', component: BlockListComponent, pathMatch: 'full' },
  { path: 'block/:hash', component: BlockDetailsComponent },
  { path: 'block-not-found', component: BlockNotFoundComponent },
  { path: 'charts/:height', component: BlockChartsComponent }
];


@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
