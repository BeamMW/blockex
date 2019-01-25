import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { routesConsts } from "../../consts";

@Component({
  selector: 'app-block-not-found',
  templateUrl: './block-not-found.component.html',
  styleUrls: ['./block-not-found.component.css']
})
export class BlockNotFoundComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  backToExplorer() {
    this.router.navigate(
      [routesConsts.HOME]
    );
  }

  ngOnInit() {
  }

}
