import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { HomepageModule } from './modules/homepage/homepage.module';
import { WebsocketModule } from './modules/websocket';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    HomepageModule,
    WebsocketModule.config({
      url: environment.wsEndpoint
  })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
