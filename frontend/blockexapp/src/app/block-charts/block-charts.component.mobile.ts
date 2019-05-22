import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { routesConsts } from "../consts";

@Component({
  selector: 'app-block-charts-mobile',
  templateUrl: './block-charts.component.mobile.html',
  styleUrls: ['./block-charts.component.mobile.css']
})
export class BlockChartsComponentMobile implements OnInit {
  loading_status: boolean = false;
  height: any;

  constructor(private router: Router,
              private route: ActivatedRoute) { }

  backToExplorer() {
      this.router.navigate(
          [routesConsts.HOME]
      );
  }

  public onChartsLoaded(chartsStatus: boolean) {
    if (chartsStatus){
      this.loading_status = false;
    }
  }

  ngOnInit() {
      this.loading_status = true;
      this.route.params.subscribe( (params) => {
          if (params.height) {
            this.height = params.height;
          }
      });
  }

}
