import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { DataService } from '../services';
import { Router, NavigationEnd} from '@angular/router';
import { routesConsts } from "../consts";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-block-details',
  templateUrl: './block-details.component.html',
  styleUrls: ['./block-details.component.css']
})
export class BlockDetailsComponent implements OnInit {
  @ViewChild('kernel') public kernel: ElementRef;

  block: any;
  loading_block: boolean = false;
  notFound: boolean = false;
  isMainnet: boolean = false;
  searchedBy = '';
  kernelsExpanded: boolean = false;

  displayedColumns: any = {
    kernels: ['fee', 'excess', 'id'],
    inputs: ['commitment', 'maturity'],
    outputs: ['commitment', 'maturity', 'coinbase'],
    block: ['name', 'value']
  };

  constructor(private router: Router, private dataService: DataService, private route: ActivatedRoute) {
    route.queryParams.subscribe(params => {
      if (params.searched_by !== undefined) {
        this.searchedBy = params.searched_by;
        setTimeout(() => {
          this.searchedBy = '';
        }, 5000);
        this.kernelsExpanded = true;
      }
/*
      this.kernel.nativeElement.scrollIntoView({ behavior: 'smooth' })

      if (this.kernel !== undefined) {
        this.kernel.nativeElement.scrollIntoView({behavior: "smooth"});
      }*/
    });
  }

  backToExplorer() {
      this.router.navigate(
          [routesConsts.HOME]
      );
  }

  ngOnInit() {
    let searchedItem = this.route.snapshot.queryParamMap.get('searched_by');
    if (searchedItem) {
      this.searchedBy = searchedItem;
      setTimeout(() => {
        this.searchedBy = '';
      }, 5000);
      this.kernelsExpanded = true;
    }
/*
    this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
            const tree = this.router.parseUrl(this.router.url);
            if (tree.queryParams["searched_by"]) {
                const element = document.querySelector('#' + tree.queryParams["searched_by"]);
                if (element) {
                    setTimeout(() => {
                        element.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
                    }, 500 );
                }
            }
         }
    });
*/

    this.isMainnet = environment.production;
    this.loading_block = true;
    this.block = {
      header: '',
      data: [],
      inputs: [],
      outputs: [],
      kernels: []
    };
    this.route.params.subscribe( (params) => {
      this.dataService.loadBlock(params.hash).subscribe((blockItem) => {
        this.block.header = 'Block ' + blockItem.height;
        this.block.data = [
          {name: 'FEE:', value: blockItem.fee, additional: blockItem.fee !== 0 ? 'Groth' : ''},
          {name: 'HASH:', value: blockItem.hash, additional: ''},
          {name: 'DIFFICULTY:', value: blockItem.difficulty.toLocaleString(), additional: ''},
          {name: 'SUBSIDY:', value: blockItem.subsidy.toLocaleString(), additional: 'Groth'},
          {name: 'CHAINWORK:', value: blockItem.chainwork, additional: ''},
          {name: 'AGE:', value: new Date(blockItem.timestamp).toLocaleDateString("en-US", {
            year: 'numeric', month: 'long',
            day: 'numeric', hour: 'numeric',
            minute: 'numeric', second: 'numeric' }), additional: ''}
        ];
        this.block.inputs = blockItem.inputs;
        this.block.outputs = blockItem.outputs;
        this.block.kernels = blockItem.kernels;
        this.loading_block = false;

/*
        setTimeout(() => {

          let element =  document.querySelector('#' + this.searchedBy);

          element.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
          //this.kernel.nativeElement.scrollIntoView({ behavior: 'smooth' })
        }, 1000)
*/

      });
    });
  }

}
