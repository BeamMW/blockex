import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-asset-create',
  templateUrl: './asset-create.component.html',
  styleUrls: ['./asset-create.component.css']
})
export class AssetCreateComponent implements OnInit {
  createForm: FormGroup;
  notEmpty = false;
  expanded = false;
  assetCommand = '';

  public params: {
    schemaVer: string,
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
      shemaVer: new FormControl(),
      assetName: new FormControl(),
      assetCode: new FormControl(),
      assetUnitName: new FormControl(),
      smallestUnitName: new FormControl(),
      ratio: new FormControl(),
      shortDescr: new FormControl('', [Validators.maxLength(128)]),
      longDescr: new FormControl('', [Validators.maxLength(1024)]),
      website: new FormControl(),
      descPaper: new FormControl(),
      favicon: new FormControl(),
      logo: new FormControl()
    });

    this.params = {
      schemaVer: '',
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
    };
  }

  ngOnInit() {
  }

  schemaVerChanged(control: FormControl) {
    this.params.schemaVer = control.value;
    this.emptyCheck();
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
    this.assetCommand = './beam-wallet asset_reg --pass 1' +
      ' -n 127.0.0.1:10000 --asset_meta "STD:' +
      (this.params.schemaVer.length > 0 ? 'SCH_VER=' + this.params.schemaVer + ';' : '') +
      (this.params.assetName.length > 0 ? 'N=' + this.params.assetName + ';' : '') +
      (this.params.assetCode.length > 0 ? 'SN=' + this.params.assetCode + ';' : '') +
      (this.params.assetUnitName.length > 0 ? 'UN=' + this.params.assetUnitName + ';' : '') +
      (this.params.smallestUnitName.length > 0 ? 'NTHUN=' + this.params.smallestUnitName + ';' : '') +
      (this.params.shortDescr.length > 0 ? 'OPT_SHORT_DESC=' + this.params.shortDescr + ';' : '') +
      (this.params.longDescr.length > 0 ? 'OPT_LONG_DESC=' + this.params.longDescr + ';' : '') +
      (this.params.website.length > 0 ? 'OPT_SITE_URL=' + this.params.website + ';' : '') +
      (this.params.descPaper.length > 0 ? 'OPT_PDF_URL=' + this.params.descPaper + ';' : '') +
      (this.params.favicon.length > 0 ? 'OPT_FAVICON_URL=' + this.params.favicon + ';' : '') +
      (this.params.logo.length > 0 ? 'OPT_LOGO_URL=' + this.params.logo + ';' : '') +
      ' --fee 100 --enable_assets';

    this.notEmpty = this.params.assetName.length > 0 ||
    this.params.schemaVer.length > 0 ||
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

  optionalExpClicked() {
    this.expanded = !this.expanded;
  }

  openDescriptorClicked() {
    window.open('https://github.com/BeamMW/beam/wiki/Asset-Descriptor-v1.0', '_blank');
  }

  copyMessage() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.assetCommand;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
}
