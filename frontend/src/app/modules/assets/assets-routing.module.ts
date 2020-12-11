import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { AssetsListComponent, AssetDetailsComponent, AssetCreateComponent } from './containers';
import { HeaderComponent } from '../../shared/components';
import { MainLayoutComponent } from '../../shared/layouts';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  children: [{
    path: '',
    children: [
        {
            path: '', component: HeaderComponent, outlet: 'header'
        }, {
            path: '', component: AssetsListComponent
        }
    ]
  }, {
    path: 'details/:id',
    children: [
        {
            path: '', component: HeaderComponent, outlet: 'header'
        }, {
            path: '', component: AssetDetailsComponent
        }
    ]
  }, {
    path: 'create',
    children: [
        {
            path: '', component: HeaderComponent, outlet: 'header'
        }, {
            path: '', component: AssetCreateComponent
        }
    ]
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class AssetsRoutingModule {}
