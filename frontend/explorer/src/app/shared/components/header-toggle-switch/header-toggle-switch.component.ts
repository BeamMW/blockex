import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-toggle-switch',
  templateUrl: './header-toggle-switch.component.html',
  styleUrls: ['./header-toggle-switch.component.scss']
})
export class HeaderToggleSwitchComponent implements AfterViewInit {
  selectedValue = 'mainnet';

  constructor() { }

  ngAfterViewInit(): void {
  }

  switcherClicked = (value: string) => {
    this.selectedValue = value;
  }
}
