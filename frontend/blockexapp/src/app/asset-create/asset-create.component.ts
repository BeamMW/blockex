import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl} from '@angular/forms';

@Component({
  selector: 'app-asset-create',
  templateUrl: './asset-create.component.html',
  styleUrls: ['./asset-create.component.css']
})
export class AssetCreateComponent implements OnInit {
  createForm: FormGroup;
  notEmpty = false;

  public params: {
    assetName: string,
    assetCode: string,
    assetUnitName: string,
    smallestUnitName: string,
    ratio: string,
    shortDescr: string,
    longDescr: string,
    website: string,
    descPaper: string,
    favicon: string,
    logo: string
  };


  constructor() {
    this.createForm = new FormGroup({
      assetName: new FormControl(),
      assetCode: new FormControl(),
      assetUnitName: new FormControl(),
      smallestUnitName: new FormControl(),
      ratio: new FormControl(),
      shortDescr: new FormControl(),
      longDescr: new FormControl(),
      website: new FormControl(),
      descPaper: new FormControl(),
      favicon: new FormControl(),
      logo: new FormControl()
    });

    this.params = {
      assetName: '',
      assetCode: '',
      assetUnitName: '',
      smallestUnitName: '',
      ratio: '',
      shortDescr: '',
      longDescr: '',
      website: '',
      descPaper: '',
      favicon: '',
      logo: ''
    }
  }

  ngOnInit() {
  }

  assetNameChanged(control: FormControl) {
    this.params.assetName = control.value;
    this.emptyCheck();
  }

  assetCodeChanged(control: FormControl) {
    this.params.assetCode = control.value;
    this.emptyCheck();
  }

  assetUnitNameChanged(control: FormControl) {
    this.params.assetUnitName = control.value;
    this.emptyCheck();
  }

  smallestUnitNameChanged(control: FormControl) {
    this.params.smallestUnitName = control.value;
    this.emptyCheck();
  }

  ratioChanged(control: FormControl) {
    this.params.ratio = control.value;
    this.emptyCheck();
  }

  shortDescrChanged(control: FormControl) {
    this.params.shortDescr = control.value;
    this.emptyCheck();
  }

  longDescrChanged(control: FormControl) {
    this.params.longDescr = control.value;
    this.emptyCheck();
  }

  websiteChanged(control: FormControl) {
    this.params.website = control.value;
    this.emptyCheck();
  }

  descPaperChanged(control: FormControl) {
    this.params.descPaper = control.value;
    this.emptyCheck();
  }

  faviconChanged(control: FormControl) {
    this.params.favicon = control.value;
    this.emptyCheck();
  }

  logoChanged(control: FormControl) {
    this.params.logo = control.value;
    this.emptyCheck();
  }

  emptyCheck() {
    this.notEmpty = this.params.assetName.length > 0 ||
    this.params.assetCode.length > 0 ||
    this.params.assetUnitName.length > 0 ||
    this.params.smallestUnitName.length > 0 ||
    this.params.ratio.length > 0 ||
    this.params.shortDescr.length > 0 ||
    this.params.longDescr.length > 0 ||
    this.params.website.length > 0 ||
    this.params.descPaper.length > 0 ||
    this.params.favicon.length > 0 ||
    this.params.logo.length > 0;
  }
}
