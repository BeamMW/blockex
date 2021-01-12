import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { routesConsts } from '../../../consts';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header-logo',
  templateUrl: './header-logo.component.html',
  styleUrls: ['./header-logo.component.scss']
})
export class HeaderLogoComponent implements OnInit {
  public isBeamx = environment.envTitle === routesConsts.BEAMX_TITLE;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigateToHomepage(): void {
    this.router.navigate([routesConsts.HOME]);
  }

}
