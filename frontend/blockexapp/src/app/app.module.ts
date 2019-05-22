import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { TimeagoModule } from 'ngx-timeago';
import {TimeAgoPipe} from 'time-ago-pipe';
import { SharedModule } from './shared/shared.module';

import {
    MatExpansionModule,
	MatButtonModule, 
	MatCheckboxModule,
	MatIconModule,
	MatTabsModule,
	MatListModule,
  MatCardModule,
  MatProgressBarModule,
  MatTableModule,
  MatToolbarModule,
  MatInputModule,
  MatFormFieldModule,
  MatPaginatorModule
} from '@angular/material';
import { BlockDetailsComponentDesktop } from './block-details/block-details.component.desktop';
import { BlockDetailsComponentMobile } from "./block-details/block-details.component.mobile";
import { AppRoutingModule } from './app-routing.module';
import { BlockListComponentDesktop } from './block-list/block-list.component.desktop';
import { BlockListComponentMobile } from  './block-list/block-list.component.mobile';
import { BlockChartsComponentDesktop } from './block-charts/block-charts.component.desktop';
import { BlockChartsComponentMobile } from './block-charts/block-charts.component.mobile';
import { ChartsComponentDesktop } from './charts-component/charts-component.component.desktop';
import { ChartsComponentMobile } from './charts-component/charts-component.component.mobile';
import { BlockNotFoundComponent } from './block-details/block-not-found/block-not-found.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';


@NgModule({
  declarations: [
    AppComponent,
    TimeAgoPipe,
    BlockDetailsComponentDesktop,
    BlockDetailsComponentMobile,
    BlockListComponentDesktop,
    BlockListComponentMobile,
    BlockChartsComponentDesktop,
    BlockChartsComponentMobile,
    ChartsComponentDesktop,
    ChartsComponentMobile,
    BlockNotFoundComponent,
  ],
  entryComponents: [
    BlockListComponentMobile,
    BlockChartsComponentMobile,
    ChartsComponentMobile,
    BlockDetailsComponentMobile,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    TimeagoModule.forRoot(),
    SharedModule,
    // Material
    MatExpansionModule,
    MatButtonModule, 
    MatCheckboxModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatCardModule,
    MatProgressBarModule,
    MatTableModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    AppRoutingModule,
    NgxChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
