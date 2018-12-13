import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlockDetailsComponent } from './block-details/block-details.component'
import { BlockListComponent } from './block-list/block-list.component'
import { BlockChartsComponent } from './block-charts/block-charts.component'

const routes: Routes = [
  {path: '', redirectTo: '/blocks', pathMatch: 'full' },
  { path: 'block/:hash', component: BlockDetailsComponent },
  { path: 'blocks', component: BlockListComponent },
  { path: 'charts/:height', component: BlockChartsComponent }
];


@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
