import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { HomepageRoutingModule } from './homepage-routing.module';
import { MainComponent, BlockDetailsComponent } from './containers';
import { GraphsComponent, StatusCardsComponent, TableComponent} from './components';

import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';
import * as more from 'highcharts/highcharts-more.src';
import * as exporting from 'highcharts/modules/exporting.src';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { ContractDetailsComponent } from './containers/contract-details/contract-details.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { HttpClientModule } from '@angular/common/http';
import { AngularSvgIconModule } from 'angular-svg-icon';

@NgModule({
  declarations: [
    MainComponent,
    BlockDetailsComponent,
    StatusCardsComponent,
    GraphsComponent,
    TableComponent,
    ContractDetailsComponent
  ],
  providers: [
    { provide: HIGHCHARTS_MODULES, useFactory: () => [ more, exporting ] }
  ],
  imports: [
    SharedModule,
    CommonModule,
    HomepageRoutingModule,
    ChartModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    NgxJsonViewerModule,
    HttpClientModule,
    AngularSvgIconModule.forRoot()
  ]
})
export class HomepageModule { }
