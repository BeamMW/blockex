import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './layouts';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components';
import { HeaderLogoComponent } from './components/header-logo/header-logo.component';
import { HeaderToggleSwitchComponent } from './components/header-toggle-switch/header-toggle-switch.component';
import { HeaderSearchComponent } from './components/header-search/header-search.component';

@NgModule({
  declarations: [
    MainLayoutComponent,
    HeaderComponent,
    HeaderLogoComponent,
    HeaderToggleSwitchComponent,
    HeaderSearchComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    MainLayoutComponent,
    HeaderComponent
  ],
  providers: [
  ]
})
export class SharedModule { }
