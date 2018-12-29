import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../services';
import { Router} from '@angular/router';

@Component({
  selector: 'app-block-details',
  templateUrl: './block-details.component.html',
  styleUrls: ['./block-details.component.css']
})
export class BlockDetailsComponent implements OnInit {

  block: any;
  loading_block: boolean = false;
  notFound: boolean = false;

  displayedColumns: any = {
    kernels: ['fee', 'excess', 'id', 'min-height','max-height'],
    inputs: ['commitment'],
    outputs: ['commitment', 'maturity', 'coinbase'],
    block: ['name', 'value']
  };

  constructor(
      private router: Router,
      private dataService: DataService,
      private route: ActivatedRoute) { }

  backToExplorer() {
      this.router.navigate(
          ['/blocks']
      );
  }

  ngOnInit() {
    const NOT_FOUND = 'notfound';
    this.loading_block = true;
    this.block = {
      header: '',
      data: [],
      inputs: [],
      outputs: [],
      kernels: []
    };
    this.route.params.subscribe( (params) => {
      if (params.hash !== 'notfound') {
        this.dataService.loadBlock(params.hash).subscribe((blockItem) => {
          this.block.header = 'Block ' + blockItem.height;
          this.block.data = [
              {name: 'Fee', value: blockItem.fee, additional: ''},
              {name: 'Hash', value: blockItem.hash, additional: ''},
              {name: 'Difficulty', value: blockItem.difficulty, additional: ''},
              {name: 'Subsidy', value: blockItem.subsidy.toLocaleString(), additional: 'Groths'},
              {name: 'Chainwork', value: blockItem.chainwork, additional: ''},
              {name: 'Age', value: new Date(blockItem.timestamp).toLocaleDateString("en-US", {
                          year: 'numeric', month: 'long',
                          day: 'numeric', hour: 'numeric',
                          minute: 'numeric', second: 'numeric' }), additional: ''}
          ];
          this.block.inputs = blockItem.inputs;
          this.block.outputs = blockItem.outputs;
          this.block.kernels = blockItem.kernels;

          console.log(blockItem);
        });
      } else if (params.hash == NOT_FOUND) {
          this.notFound = true;
      }
      this.loading_block = false;
    });
  }

}
