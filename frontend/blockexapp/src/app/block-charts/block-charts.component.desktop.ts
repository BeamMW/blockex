import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { routesConsts } from "../consts";

@Component({
  selector: 'app-block-charts-desktop',
  templateUrl: './block-charts.component.desktop.html',
  styleUrls: ['./block-charts.component.desktop.css']
})
export class BlockChartsComponentDesktop implements OnInit {
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
