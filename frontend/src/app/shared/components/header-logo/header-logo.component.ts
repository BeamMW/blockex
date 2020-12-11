import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routesConsts } from '../../../consts';

@Component({
  selector: 'app-header-logo',
  templateUrl: './header-logo.component.html',
  styleUrls: ['./header-logo.component.scss']
})
export class HeaderLogoComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigateToHomepage(): void {
    this.router.navigate([routesConsts.HOME]);
  }

}
