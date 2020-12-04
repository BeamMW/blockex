import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  // {
  //   path: '', redirectTo: 'homepage/main', pathMatch: 'full'
  // },
  {
    path: '',
    loadChildren: () => import('./modules/homepage/homepage.module').then(m => m.HomepageModule)
  }, {
    path: '**', redirectTo: ''
  }
  // {
  //   path: 'initialize',
  //   loadChildren: () => import('./modules/first-time-flow/first-time-flow.module').then(m => m.FirstTimeFlowModule)
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
