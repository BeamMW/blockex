import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl} from '@angular/forms';
import {style, state, animate, transition, trigger} from '@angular/animations';

const COMMAND_DEFAULT_LENGTH = 14;
const COMMAND_MAX_LENGTH = 16384;
const DESCRIPTOR_LINK = 'https://github.com/BeamMW/beam/wiki/Asset-Descriptor-v1.0';
const RATIO_MAX = Math.pow(2, 128) - 2;

@Component({
  selector: 'app-asset-create',
  templateUrl: './asset-create.component.html',
  styleUrls: ['./asset-create.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity:0}),
        animate(400, style({opacity:1})) 
      ]),
      transition(':leave', [
        animate(400, style({opacity:0})) 
      ])
    ])
  ]
})

export class AssetCreateComponent implements OnInit {
  createForm: FormGroup;
  isEmpty = true;
  expanded = false;
  assetCommand = '';
  commandLength = 0;
  urlRegex = /^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[\w#!:.?+=&%@\-/]*)?$/;

  public switcherValues = {
    WIN: 'WINDOWS',
    LIN: 'LINUX'
  };
  public switcherSelectedValue: string = this.switcherValues.LIN;

  public errorState: {
    isActive: boolean,
    text: string
  }

  constructor() {
    this.createForm = new FormGroup({
      shemaVer: new FormControl({value: '', disabled: true}),
      assetName: new FormControl('', [Validators.pattern('^[a-zA-Z0-9.,_-\\s]*$')]),
      assetCode: new FormControl('', [Validators.maxLength(6), Validators.pattern('^[a-zA-Z0-9.,_-\\s]*$')]),
      assetUnitName: new FormControl('', [Validators.pattern('^[a-zA-Z0-9.,_-\\s]*$')]),
      smallestUnitName: new FormControl('', [Validators.pattern('^[a-zA-Z0-9.,_-\\s]*$')]),
      ratio: new FormControl('', [Validators.max(RATIO_MAX), Validators.pattern('^[0-9]*')]),
      shortDescr: new FormControl('', [Validators.maxLength(128)]),
      longDescr: new FormControl('', [Validators.maxLength(1024)]),
      website: new FormControl('', [Validators.pattern(this.urlRegex)]),
      descPaper: new FormControl('', [Validators.pattern(this.urlRegex)]),
      favicon: new FormControl('', Validators.pattern(this.urlRegex)),
      logo: new FormControl('', Validators.pattern(this.urlRegex)),
      color: new FormControl('', [Validators.pattern('^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$')])
    });

    this.errorState = {
      isActive: false,
      text: ''
    }
  }

  ngOnInit() {
    this.createForm.valueChanges.subscribe(val => {
      this.emptyCheck();
    });
  }

  public setError(value: string) {
    this.errorState.text = value;
    this.errorState.isActive = true;
  }

  public clearError() {
    this.errorState.text = '';
    this.errorState.isActive = false;
  }

  getCommand() {
    const formItems = this.createForm.value;
    const command = 'SCH_VER=1;' +
      (formItems.assetName.length > 0 ? 'N=' + formItems.assetName + ';' : '') +
      (formItems.assetCode.length > 0 ? 'SN=' + formItems.assetCode + ';' : '') +
      (formItems.assetUnitName.length > 0 ? 'UN=' + formItems.assetUnitName + ';' : '') +
      (formItems.smallestUnitName.length > 0 ? 'NTHUN=' + formItems.smallestUnitName + ';' : '') +
      (formItems.ratio.length > 0 ? 'NTH_RATIO=' + formItems.ratio + ';' : 'NTH_RATIO=100000000;') +
      (formItems.shortDescr.length > 0 ? 'OPT_SHORT_DESC=' + formItems.shortDescr.replace( /"/g, '\\"' ) + ';' : '') +
      (formItems.longDescr.length > 0 ? 'OPT_LONG_DESC=' + formItems.longDescr.replace( /"/g, '\\"' ) + ';' : '') +
      (formItems.website.length > 0 ? 'OPT_SITE_URL=' + formItems.website + ';' : '') +
      (formItems.descPaper.length > 0 ? 'OPT_PDF_URL=' + formItems.descPaper + ';' : '') +
      (formItems.favicon.length > 0 ? 'OPT_FAVICON_URL=' + formItems.favicon + ';' : '') +
      (formItems.logo.length > 0 ? 'OPT_LOGO_URL=' + formItems.logo + ';' : '') +
      (formItems.color.length > 0 ? 'OPT_COLOR=' + formItems.color + ';' : '');

    this.commandLength = command.length + COMMAND_DEFAULT_LENGTH;

    if(this.createForm.invalid) {
      this.setError('Invalid data');
    } else if (this.commandLength > COMMAND_MAX_LENGTH) {
      this.setError('Maximum of 16384 characters in metadata');
    } else {
      this.clearError();
    }

    return command;
  }

  emptyCheck() {
    const formItems = this.createForm.value;
    this.assetCommand = (this.switcherSelectedValue === this.switcherValues.LIN ? './' : '') + 
      'beam-wallet asset_reg --pass 1 -n 127.0.0.1:10000 --asset_meta "STD:' + 
      this.getCommand() + '" --fee 100000 --enable_assets';
    this.isEmpty = !(formItems.assetName || formItems.assetCode ||
      formItems.assetUnitName || formItems.smallestUnitName ||
      formItems.ratio || formItems.shortDescr ||
      formItems.longDescr || formItems.website ||
      formItems.descPaper || formItems.favicon ||
      formItems.logo || formItems.color);
  }

  optionalExpClicked() {
    this.expanded = !this.expanded;
  }

  openDescriptorClicked() {
    window.open(DESCRIPTOR_LINK, '_blank');
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

  public switcherClicked = (event, value: string) => {
    this.switcherSelectedValue = value;
    this.emptyCheck();
  }
}