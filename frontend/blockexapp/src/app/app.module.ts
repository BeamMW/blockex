import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { TimeagoModule } from 'ngx-timeago';
import {TimeAgoPipe} from 'time-ago-pipe';

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
import { BlockDetailsComponent } from './block-details/block-details.component';
import { AppRoutingModule } from './/app-routing.module';
import { BlockListComponent } from './block-list/block-list.component';
import { BlockChartsComponent } from './block-charts/block-charts.component';
import { ChartsComponent } from './charts-component/charts-component.component';


@NgModule({
  declarations: [
    AppComponent,
    TimeAgoPipe,
    BlockDetailsComponent,
    BlockListComponent,
    BlockChartsComponent,
    ChartsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    TimeagoModule.forRoot(),
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
