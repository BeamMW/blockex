import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../../services';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailsComponent implements OnInit {
  assetData: any;
  assetLoaded = false;
  isFullScreen = false;
  id = null;
  constructor(private router: Router, private route: ActivatedRoute, private dataService: DataService) {
    this.isFullScreen = window.innerWidth > 768;
  }

  fullDesc = 'BEAMX token is a Confidential Asset issued on top of the Beam blockchain with a fixed emission of 100,000,000 units (except for the lender of a "last resort" scenario).\
  BEAMX is the governance token for the BeamX DAO, managed by the BeamX DAO Core contract\
  Holders can earn BeamX tokens by participating in the DAO activities: providing liquidity to the DeFi applications governed by the DAO or participating in the governance process.'

  public iconBeamx: string = `../../../../../assets/beamx-icon.svg`;

  getAssetItem (id) {
    this.assetData = this.dataService.assetsList.find((item) => {
      return item.id === parseInt(id, 10);
    });

    this.assetLoaded = !!this.assetData;
  }

  siteClicked(id, url) {
    window.open(id === 7 ? 'https://www.beamxdao.org/' : url, '_blank');
  }

  pdfClicked(id, url) {
    window.open(id === 7 ? 'https://documentation.beam.mw/overview/beamx-tokenomics' : url, '_blank');
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = params.id;
      if (params.id !== undefined && this.dataService.assetsList.length > 0) {
        this.getAssetItem(params.id);
      } else if (params.id !== undefined && this.dataService.assetsList.length === 0) {
        this.dataService.getAssetsList().subscribe((data) => {
          this.dataService.loadAssets(data);
          this.getAssetItem(params.id);
        });
      }
    });
  }

}
