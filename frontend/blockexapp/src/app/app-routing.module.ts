import { NgModule } from '@angular/core';
import { PreloadAllModules, Router, RouterModule, Routes } from '@angular/router';
import { ApplicationStateService } from './services';

import { BlockDetailsComponentDesktop } from './block-details/block-details.component.desktop';
import { BlockDetailsComponentMobile } from './block-details/block-details.component.mobile';
import { BlockNotFoundComponent } from './block-details/block-not-found/block-not-found.component';
import { BlockListComponentDesktop } from './block-list/block-list.component.desktop';
import { BlockListComponentMobile } from './block-list/block-list.component.mobile';
import { BlockChartsComponentDesktop } from './block-charts/block-charts.component.desktop';
import { BlockChartsComponentMobile } from './block-charts/block-charts.component.mobile';
import { AssetsListComponent } from './assets-list/assets-list.component';
import { AssetCreateComponent } from './asset-create/asset-create.component';
import { AssetDetailsComponent } from './asset-details/asset-details.component';

const desktop_routes: Routes = [
  {path: '', component: BlockListComponentDesktop, pathMatch: 'full' },
  { path: 'block/:hash', component: BlockDetailsComponentDesktop },
  { path: 'block', component: BlockDetailsComponentDesktop },
  { path: 'block-not-found', component: BlockNotFoundComponent },
  { path: 'charts/:height', component: BlockChartsComponentDesktop },
  { path: 'assets', component: AssetsListComponent },
  { path: 'asset-details/:id', component: AssetDetailsComponent },
  { path: 'asset-create', component: AssetCreateComponent },
  { path: '**', redirectTo: '' }
];

const mobile_routes: Routes = [
  {path: '', component: BlockListComponentMobile, pathMatch: 'full' },
  { path: 'block/:hash', component: BlockDetailsComponentMobile },
  { path: 'block', component: BlockDetailsComponentMobile },
  { path: 'block-not-found', component: BlockNotFoundComponent },
  { path: 'charts/:height', component: BlockChartsComponentMobile },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [ RouterModule.forRoot(desktop_routes, {preloadingStrategy: PreloadAllModules}) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {

  public constructor(private router: Router,
    private applicationStateService: ApplicationStateService) {

    if (applicationStateService.getIsMobileResolution()) {
      router.resetConfig(mobile_routes);
    }
  }

  /**
   * this function inject new routes for the given module instead the current routes.
   * the operation happens on the given current routes object so after
   * this method a call to reset routes on router should be called with the the current routes object.
   * @param currentRoutes
   * @param routesToInject
   * @param childNameToReplaceRoutesUnder - the module name to replace its routes.
   */
  private injectModuleRoutes(currentRoutes: Routes, routesToInject: Routes, childNameToReplaceRoutesUnder: string): void {
    for (let i = 0; i < currentRoutes.length; i++) {
      if (currentRoutes[i].loadChildren != null &&
        currentRoutes[i].loadChildren.toString().indexOf(childNameToReplaceRoutesUnder) != -1) {
        // we found it. taking the route prefix
        let prefixRoute: string = currentRoutes[i].path;
        // first removing the module line
        currentRoutes.splice(i, 1);
        // now injecting the new routes
        // we need to add the prefix route first
        this.addPrefixToRoutes(routesToInject, prefixRoute);
        for (let route of routesToInject) {
          currentRoutes.push(route);
        }
        // since we found it we can break the injection
        return;
      }

      if (currentRoutes[i].children != null) {
        this.injectModuleRoutes(currentRoutes[i].children, routesToInject, childNameToReplaceRoutesUnder);
      }
    }
  }

  private addPrefixToRoutes(routes: Routes, prefix: string) {
    for (let i = 0; i < routes.length; i++) {
      routes[i].path = prefix + '/' + routes[i].path;
    }
  }
}
