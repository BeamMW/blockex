import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { HomepageRoutingModule } from './homepage-routing.module';
import { MainComponent, BlockDetailsComponent } from './containers';
import { GraphsComponent, StatusCardsComponent} from './components';

@NgModule({
  declarations: [
    MainComponent,
    BlockDetailsComponent,
    StatusCardsComponent,
    GraphsComponent
  ],
  providers: [
  ],
  imports: [
    SharedModule,
    CommonModule,
    HomepageRoutingModule,
  ]
})
export class HomepageModule { }
