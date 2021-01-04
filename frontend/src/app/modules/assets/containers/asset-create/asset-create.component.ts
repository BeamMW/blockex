import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl} from '@angular/forms';

@Component({
  selector: 'app-asset-create',
  templateUrl: './asset-create.component.html',
  styleUrls: ['./asset-create.component.scss']
})
export class AssetCreateComponent implements OnInit {
  createForm: FormGroup;
  notEmpty = false;
  expanded = false;
  assetCommand = '';
  commandLength = 0;
  COMMAND_DEFAULT_LENGTH = 14; // length of 'STD:SCH_VER=1;'
  COMMAND_MAX_LENGTH = 16384;
  urlRegex = /^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[\w#!:.?+=&%@\-/]*)?$/;

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
      shemaVer: new FormControl({value: '', disabled: true}),
      assetName: new FormControl(),
      assetCode: new FormControl(),
      assetUnitName: new FormControl(),
      smallestUnitName: new FormControl(),
      ratio: new FormControl(),
      shortDescr: new FormControl('', [Validators.maxLength(128)]),
      longDescr: new FormControl('', [Validators.maxLength(1024)]),
      website: new FormControl('', [Validators.pattern(this.urlRegex)]),
      descPaper: new FormControl('', [Validators.pattern(this.urlRegex)]),
      favicon: new FormControl('', Validators.pattern(this.urlRegex)),
      logo: new FormControl('', Validators.pattern(this.urlRegex))
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

  schemaVerChanged(control: AbstractControl) {
    this.params.schemaVer = control.value;
    this.emptyCheck();
  }

  assetNameChanged(control: AbstractControl) {
    this.params.assetName = control.value;
    this.emptyCheck();
  }

  assetCodeChanged(control: AbstractControl) {
    this.params.assetCode = control.value;
    this.emptyCheck();
  }

  assetUnitNameChanged(control: AbstractControl) {
    this.params.assetUnitName = control.value;
    this.emptyCheck();
  }

  smallestUnitNameChanged(control: AbstractControl) {
    this.params.smallestUnitName = control.value;
    this.emptyCheck();
  }

  ratioChanged(control: AbstractControl) {
    this.params.ratio = control.value;
    this.emptyCheck();
  }

  shortDescrChanged(control: AbstractControl) {
    this.params.shortDescr = control.value;
    this.emptyCheck();
  }

  longDescrChanged(control: AbstractControl) {
    this.params.longDescr = control.value;
    this.emptyCheck();
  }

  websiteChanged(control: AbstractControl) {
    this.params.website = control.value;
    this.emptyCheck();
  }

  descPaperChanged(control: AbstractControl) {
    this.params.descPaper = control.value;
    this.emptyCheck();
  }

  faviconChanged(control: AbstractControl) {
    this.params.favicon = control.value;
    this.emptyCheck();
  }

  logoChanged(control: AbstractControl) {
    this.params.logo = control.value;
    this.emptyCheck();
  }

  getCommand() {
    const command = (this.params.schemaVer.length > 0 ? 'SCH_VER=' + this.params.schemaVer + ';' : '') +
    (this.params.assetName.length > 0 ? 'N=' + this.params.assetName + ';' : '') +
    (this.params.assetCode.length > 0 ? 'SN=' + this.params.assetCode + ';' : '') +
    (this.params.assetUnitName.length > 0 ? 'UN=' + this.params.assetUnitName + ';' : '') +
    (this.params.smallestUnitName.length > 0 ? 'NTHUN=' + this.params.smallestUnitName + ';' : '') +
    (this.params.ratio.length > 0 ? 'NTH_RATIO=' + this.params.ratio + ';' : '') +
    (this.params.shortDescr.length > 0 ? 'OPT_SHORT_DESC=' + this.params.shortDescr + ';' : '') +
    (this.params.longDescr.length > 0 ? 'OPT_LONG_DESC=' + this.params.longDescr + ';' : '') +
    (this.params.website.length > 0 ? 'OPT_SITE_URL=' + this.params.website + ';' : '') +
    (this.params.descPaper.length > 0 ? 'OPT_PDF_URL=' + this.params.descPaper + ';' : '') +
    (this.params.favicon.length > 0 ? 'OPT_FAVICON_URL=' + this.params.favicon + ';' : '') +
    (this.params.logo.length > 0 ? 'OPT_LOGO_URL=' + this.params.logo + ';' : '');

    this.commandLength = command.length + this.COMMAND_DEFAULT_LENGTH;
    return command;
  }

  emptyCheck() {
    this.assetCommand = './beam-wallet asset_reg --pass 1' +
      ' -n 127.0.0.1:10000 --asset_meta "STD:SCH_VER=1;' + this.getCommand() + '" --fee 100 --enable_assets';
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