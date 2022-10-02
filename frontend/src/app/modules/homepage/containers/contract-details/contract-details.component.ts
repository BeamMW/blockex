import { Component, OnInit, Injectable } from '@angular/core';
import { DataService } from '../../../../services';
import { Router, NavigationEnd} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { routesConsts } from '../../../../consts';
@Component({
  selector: 'app-contract-details',
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.scss']
})
export class ContractDetailsComponent implements OnInit {

  contractData: any;
  cid = '';
  loaded = false;

  constructor(private router: Router,
    private dataService: DataService, 
    private route: ActivatedRoute) {
  }

  backButtonClicked() {
    this.router.navigate(
      [routesConsts.HOME]
    );
  }

  getMethodId(id) {
    return id == 999 ? '' : id;
  }

  ngOnInit(): void {
    this.route.params.subscribe( (params) => {
      this.cid = params.cid;
      this.dataService.loadContractById(params.cid).subscribe((blockItem) => {
        this.contractData = blockItem['data'];
        this.loaded = true;
    });
  });
  }

}
