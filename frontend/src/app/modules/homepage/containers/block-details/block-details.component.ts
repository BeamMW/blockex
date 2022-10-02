import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ActivatedRoute} from '@angular/router';
import { DataService } from '../../../../services';
import { Router, NavigationEnd} from '@angular/router';
import { routesConsts } from "../../../../consts";
import {environment} from "../../../../../environments/environment";
import { DeviceDetectorService } from 'ngx-device-detector';
import {FormControl} from '@angular/forms';
import {TooltipPosition} from '@angular/material/tooltip';

@Component({
  selector: 'app-block-details',
  templateUrl: './block-details.component.html',
  styleUrls: ['./block-details.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BlockDetailsComponent implements OnInit {
  @ViewChild('kernel') public kernel: ElementRef;
  expandedElement: null;
  dataSource = ELEMENT_DATA;
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[1]);

  block: any;
  kernels = [];
  loading_block: boolean = false;
  notFound: boolean = false;
  isMainnet: boolean = false;
  searchedBy = '';
  isFadein = true;

  kernelsExpanded: boolean = false;

  displayedColumns: any = {
    kernels: ['fee', 'id'],
    kernelsWithExpand: ['fee', 'id', 'expand'],
    inputs: ['height', 'commitment'],
    outputs: ['commitment'],
    block: ['name', 'value']
  };
  public isMobile = this.deviceService.isMobile();

  constructor(
      private router: Router,
      private deviceService: DeviceDetectorService,
      private dataService: DataService, 
      private route: ActivatedRoute) {
    route.queryParams.subscribe(params => {
      if (params.searched_by !== undefined) {
        this.searchedBy = params.searched_by;
        this.isFadein = true;
        setTimeout(() => {
          this.isFadein = false;
        }, 5000);
        this.kernelsExpanded = true;
      }
      setTimeout(() => {
          let element = null;
          if(this.searchedBy.length > 0) {
            element = document.querySelector("[id='"+this.searchedBy+"']");
          }
          if (element) {
            element.scrollIntoView({behavior: 'smooth'});
          }
        }, 300)
    });
  }

  backToExplorer() {
      this.router.navigate(
          [routesConsts.HOME]
      );
  }

  prev_clicked() {
    this.router.navigate(
      [routesConsts.BLOCK_DETAILS, this.block['prev']]
    );
  }

  next_clicked() {
    this.router.navigate(
      [routesConsts.BLOCK_DETAILS, this.block['next']]
    );
  }

  loadDetails(blockItem) {
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

    if (blockItem.rate_btc !== null && blockItem.rate_usd !== null) {
      this.block.data.push({
        name: 'EXCHANGE RATE', value: blockItem.rate_btc + ' BTC | ' + blockItem.rate_usd + ' USD', additional: ''
      });
    }

    this.block.inputs = blockItem.inputs;
    this.block.outputs = blockItem.outputs;
    this.block.kernels = blockItem.kernels;
    this.block['prev'] = blockItem['prev'] !== undefined ? blockItem['prev'] : '';
    this.block['next'] = blockItem['next'] !== undefined ? blockItem['next'] : '';
    this.loading_block = false;


    setTimeout(() => {
      let element = null;
      if(this.searchedBy.length > 0) {
        element = document.querySelector("[id='"+this.searchedBy+"']");
      }
      if (element) {
        element.scrollIntoView({behavior: 'smooth'});
      }
    }, 300)
  }

  ngOnInit() {
    let searchedItem = this.route.snapshot.queryParamMap.get('searched_by');
    let kernel_id = this.route.snapshot.queryParamMap.get('kernel_id');
    if (kernel_id) {
      searchedItem = kernel_id;
      this.dataService.searchBlock(kernel_id).subscribe((blockItem) => {
        this.loadDetails(blockItem['result']);
        this.kernels = blockItem['kernels'];
      });
    }
    if (searchedItem) {
      this.isFadein = true;
      this.searchedBy = searchedItem;
      setTimeout(() => {
        this.isFadein = false;
      }, 5000);
      this.kernelsExpanded = true;
    }

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
          this.loadDetails(blockItem['result']);
          this.kernels = blockItem['kernels'];
      });
    });
  }

}


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    symbol: 'H',
    description: `Hydrogen is a chemical element with symbol H and atomic number 1. With a standard
        atomic weight of 1.008, hydrogen is the lightest element on the periodic table.`,
  },
  {
    position: 2,
    name: 'Helium',
    weight: 4.0026,
    symbol: 'He',
    description: `Helium is a chemical element with symbol He and atomic number 2. It is a
        colorless, odorless, tasteless, non-toxic, inert, monatomic gas, the first in the noble gas
        group in the periodic table. Its boiling point is the lowest among all the elements.`,
  },
  {
    position: 3,
    name: 'Lithium',
    weight: 6.941,
    symbol: 'Li',
    description: `Lithium is a chemical element with symbol Li and atomic number 3. It is a soft,
        silvery-white alkali metal. Under standard conditions, it is the lightest metal and the
        lightest solid element.`,
  },
  {
    position: 4,
    name: 'Beryllium',
    weight: 9.0122,
    symbol: 'Be',
    description: `Beryllium is a chemical element with symbol Be and atomic number 4. It is a
        relatively rare element in the universe, usually occurring as a product of the spallation of
        larger atomic nuclei that have collided with cosmic rays.`,
  },
  {
    position: 5,
    name: 'Boron',
    weight: 10.811,
    symbol: 'B',
    description: `Boron is a chemical element with symbol B and atomic number 5. Produced entirely
        by cosmic ray spallation and supernovae and not by stellar nucleosynthesis, it is a
        low-abundance element in the Solar system and in the Earth's crust.`,
  },
  {
    position: 6,
    name: 'Carbon',
    weight: 12.0107,
    symbol: 'C',
    description: `Carbon is a chemical element with symbol C and atomic number 6. It is nonmetallic
        and tetravalent—making four electrons available to form covalent chemical bonds. It belongs
        to group 14 of the periodic table.`,
  },
  {
    position: 7,
    name: 'Nitrogen',
    weight: 14.0067,
    symbol: 'N',
    description: `Nitrogen is a chemical element with symbol N and atomic number 7. It was first
        discovered and isolated by Scottish physician Daniel Rutherford in 1772.`,
  },
  {
    position: 8,
    name: 'Oxygen',
    weight: 15.9994,
    symbol: 'O',
    description: `Oxygen is a chemical element with symbol O and atomic number 8. It is a member of
         the chalcogen group on the periodic table, a highly reactive nonmetal, and an oxidizing
         agent that readily forms oxides with most elements as well as with other compounds.`,
  },
  {
    position: 9,
    name: 'Fluorine',
    weight: 18.9984,
    symbol: 'F',
    description: `Fluorine is a chemical element with symbol F and atomic number 9. It is the
        lightest halogen and exists as a highly toxic pale yellow diatomic gas at standard
        conditions.`,
  },
  {
    position: 10,
    name: 'Neon',
    weight: 20.1797,
    symbol: 'Ne',
    description: `Neon is a chemical element with symbol Ne and atomic number 10. It is a noble gas.
        Neon is a colorless, odorless, inert monatomic gas under standard conditions, with about
        two-thirds the density of air.`,
  },
];