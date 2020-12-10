import { Component, OnInit } from '@angular/core';
import { routesConsts } from '../../../consts';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public isAssets = this.router.url.split('/')[1] === 'assets';
  constructor(private router: Router) { }

  ngOnInit(): void {}

  assetsClicked(): void {
    this.router.navigate([routesConsts.CONFIDENTIAL_ASSETS_LIST]);
  }
}
