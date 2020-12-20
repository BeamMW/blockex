import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  activeCurrency: string;
  constructor() { }

  ngOnInit(): void {
  }


  onChangeStatsCurrency(value: string) {
    this.activeCurrency = value;
  }
}
