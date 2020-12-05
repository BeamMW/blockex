import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { HomepageRoutingModule } from './homepage-routing.module';
import { MainComponent, BlockDetailsComponent } from './containers';
import { GraphsComponent, StatusCardsComponent} from './components';

import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';
import * as more from 'highcharts/highcharts-more.src';
import * as exporting from 'highcharts/modules/exporting.src';

@NgModule({
  declarations: [
    MainComponent,
    BlockDetailsComponent,
    StatusCardsComponent,
    GraphsComponent
  ],
  providers: [
    { provide: HIGHCHARTS_MODULES, useFactory: () => [ more, exporting ] }
  ],
  imports: [
    SharedModule,
    CommonModule,
    HomepageRoutingModule,
    ChartModule
  ]
})
export class HomepageModule { }
