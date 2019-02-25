import {
  Component,
  ElementRef,
  ChangeDetectorRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnInit} from '@angular/core';
import { DataService } from '../services';
import { Chart } from 'chart.js';
import {Router} from "@angular/router";
import { chartsConsts } from '../consts';

import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-charts-component',
  templateUrl: './charts-component.component.html',
  styleUrls: ['./charts-component.component.css']
})
export class ChartsComponent implements OnInit {
  @Input() height: any;
  @Input() fullSize: boolean;
  @Output() chartsLoaded = new EventEmitter<boolean>();
  @ViewChild('charts') public chartEl: ElementRef;
  @ViewChild('feeChart') public feeChartEl: ElementRef;

  feeChart : any;
  chart : any;
  chartLoading : boolean = false;

  chartsData = {
      range: [],
      dates: [],
      difficulty: [],
      hashrate: [],
      fee: [],
      fixedLine: [],
      averageBlocks: []
    };

  isHashRateChecked : boolean = false;
  chartPeriods = [
      {num: 1, name: "Day"},
      {num: 7, name: "Week"},
      {num: 30, name: "Month"},
      {num: 365, name: "Year"},
      {num: 0, name: "All time"}
  ];

  selectedPeriodBlocks = this.chartPeriods[1];
  selectedPeriodFee = this.chartPeriods[1];

  charts = [];
  chartOptions = {};
  feeChartOptions = {};

  constructor(private changeDetectionRef: ChangeDetectorRef, private dataService: DataService, private router: Router) { }

  createChart(container, options?: Object) {
    let opts = !!options ? options : this.chartOptions;
    let e = document.createElement("div");

    container.appendChild(e);

    let chartOptions = opts['chart'];
    if (!!chartOptions) {
      chartOptions['renderTo'] = e;
    }
    else {
      chartOptions = {
        'renderTo': e
      }
    }

    this.charts.push(new Highcharts.Chart(opts));
  }

  setHashRateState(checked) {
      this.isHashRateChecked = checked;
      if (checked) {
        this.charts[0].addSeries({
          name: 'Hashrate',
          showInLegend: false,
          data: this.chartsData.hashrate,
          marker: {
            enabled: false
          },
          lineWidth: 1,
          color: '#ff99ff',
          yAxis: 1
        });
      } else {
        this.charts[0].series[this.charts[0].series.length - 1].remove(true);
      }
  }

  blocksSelectChange(e) {
    this.chartUpdate(e.num, this.charts[0], 'blocks')
  }

  feeSelectChange(e) {
    this.chartUpdate(e.num, this.charts[1], 'fee')
  }

  chartUpdate(newRange, chart, type) {
    this.dataService.loadBlocksRange(newRange).subscribe((data) => {
      this.chartsData.range.length = 0;
      this.chartsData.dates.length = 0;
      this.chartsData.difficulty.length = 0;
      this.chartsData.hashrate.length = 0;
      this.chartsData.fee.length = 0;
      this.chartsData.fixedLine.length = 0;
      this.chartsData.averageBlocks.length = 0;

      this.constructChartsData(data);

      if(type == 'blocks') {
        chart.series[0].setData( this.chartsData.range, true);
        chart.series[1].setData(this.chartsData.difficulty, true);
        chart.series[2].setData(this.chartsData.fixedLine, true);
        chart.series[3].setData(this.chartsData.averageBlocks, true);
        if(this.isHashRateChecked) {
          chart.series[4].setData(this.chartsData.hashrate, true);
        }
      } else {
        chart.series[0].setData( this.chartsData.fee, true);
      }
    });
  }

  constructChartsData(data) {
    let initialDate = new Date(data[0].timestamp);
    let avgDifficulty = 0;
    let blocksCounter = 0, feeCounter = 0;

    data.map((item) => {
      let initialDateWithOffset = initialDate.getTime()
        + chartsConsts.MINUTE * chartsConsts.COUNT_OF_MINUTES;

      if (new Date(item.timestamp).getTime() <= initialDateWithOffset) {
        blocksCounter++;
        feeCounter += item.fee;
        avgDifficulty += item.difficulty;
      } else {
        let timestampVal = + new Date(item.timestamp);
        let difficulty = avgDifficulty / blocksCounter;
        this.chartsData.dates.push(timestampVal);
        this.chartsData.range.push([timestampVal, blocksCounter]);
        this.chartsData.difficulty.push([timestampVal, difficulty]);
        this.chartsData.hashrate.push([timestampVal, difficulty / 60]);
        this.chartsData.fee.push([timestampVal, feeCounter]);
        this.chartsData.fixedLine.push([timestampVal, chartsConsts.FIXED_BLOCKS_COORD]);
        feeCounter = item.fee;
        blocksCounter = 1;
        avgDifficulty = 0;
        initialDate = new Date(item.timestamp);
      }
    });

    let averageBlocks = data.length / this.chartsData.range.length;
    this.chartsData.dates.map((item) => {
      this.chartsData.averageBlocks.push([item, averageBlocks]);
    });
  }

  initCharts() {
    this.chartOptions = {
      title: {
        text: '',
      },
      credits: {
          enabled: false
        },
      yAxis: [{
        lineWidth: 0,
        lineColor: '#ff51ff',
        gridLineColor: 'rgba(255, 255, 255, 0.1)',
        title: {
          text: 'Blocks per hour',
          margin: 34,
          style: {
            'font-size': '12px',
            'font-weight': '600',
            'font-style': 'normal',
            'font-stretch': 'normal',
            'line-height': 'normal',
            'letter-spacing': '0.3px',
            'color': '#ffffff'
          }
        },
        labels: {
          style: {
            'opacity': '0.5',
            'font-size': '12px',
            'font-weight': 'normal',
            'font-style': 'normal',
            'font-stretch': 'normal',
            'line-height': 'normal',
            'letter-spacing': 'normal',
            'color': '#ffffff'
          }
        }
      }, {
        min: 0,
        lineWidth: 0,
        gridLineColor: 'rgba(255, 255, 255, 0.1)',
        opposite: true,
        title: {
          rotation: 270,
          text: 'Average difficulty',
          margin: 34,
          style: {
            'font-size': '12px',
            'font-weight': '600',
            'font-style': 'normal',
            'font-stretch': 'normal',
            'line-height': 'normal',
            'letter-spacing': '0.3px',
            'color': '#ffffff'
          }
        },
        labels: {
          style: {
            'opacity': '0.5',
            'font-size': '12px',
            'font-weight': 'normal',
            'font-style': 'normal',
            'font-stretch': 'normal',
            'line-height': 'normal',
            'letter-spacing': 'normal',
            'color': '#ffffff'
          }
        }
      }],
      xAxis: {
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0,
        type: 'datetime',
        minTickInterval: chartsConsts.MILLISECONDS_IN_DAY,
        gridLineColor: 'rgba(255, 255, 255, 0.1)',
        gridLineWidth: 1,
        labels: {
          format: '{value:%b-%e}',
          style: {
            'opacity': '0.5',
            'font-size': '12px',
            'font-weight': 'normal',
            'font-style': 'normal',
            'font-stretch': 'normal',
            'line-height': 'normal',
            'letter-spacing': 'normal',
            'color': '#ffffff'
          }
        }
      },
      legend: {
        width:380,
        itemWidth: 190,
        itemMarginBottom:12,
        itemStyle: {
          width: 140,
          'font-family': 'ProximaNova',
          'font-size': '12px',
          'font-weight': 'normal',
          'font-style': 'normal',
          'font-stretch': 'normal',
          'line-height': 'normal',
          'letter-spacing': '0.5px',
          'color': '#ffffff'
        },
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        x: 0,
        y: 10
      },
      tooltip: {
        followPointer: false,
        useHTML:true,
        backgroundColor: 'rgb(80,67,89)',
        borderRadius: 10,
        borderWidth: 0,
        shadow: false,
        formatter: function () {
            let date = new Date(this.x);
            return '<div class="chart-tooltip-container">' +
              '<div class="tooltip-line-color" style="color:'+this.color+'">\u25CF</div>' +
              '<div class="tooltip-title">' + this.series.name + '</div>' +
              '<div class="tooltip-date">' + date.getDate() + ' ' +
                  new Intl.DateTimeFormat('en-US', {month:"long"}).format(date) + ' ' +
                  date.getFullYear() + ', ' + (date.getHours() < 10 ? '0' : '') + date.getHours()
                  + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes()  + '</div>' +
              '<div class="tooltip-value">' + this.y.toFixed(0) + '</div></div>';
        }
      },
      series: [{
        marker: {
          fillColor: 'rgba(255,255,255,0)',
          lineWidth: 2,
          radius: 1,
          symbol: 'circle',
          lineColor: null
        },
        name: 'Blocks per hour',
        color: '#24c1ff',
        data: this.chartsData.range
      }, {
        marker: {
          fillColor: 'rgba(255,255,255,0)',
          lineWidth: 2,
          radius: 1,
          symbol: 'circle',
          lineColor: null
        },
        name: 'Average difficulty',
        color: '#ff51ff',
        data: this.chartsData.difficulty,
        yAxis: 1
      }, {
        marker: {
          enabled: false
        },
        lineWidth: 1,
        name: 'Fixed 60 blocks',
        color: '#24c1ff',
        data: this.chartsData.fixedLine
      }, {
        marker: {
          enabled: false
        },
        lineWidth: 1,
        name: 'Average blocks',
        color: '#ff51ff',
        data: this.chartsData.averageBlocks
      }],
      chart: {
        width: 580,
        height: 430,
        marginBottom: 100,
        backgroundColor: 'rgba(255,255,255,0)',
        style: {
          fontFamily: 'ProximaNova',
        },
        type: 'line'
      }
    };
    this.feeChartOptions = {
      title: {
        text: ''
      },
      credits: {
          enabled: false
        },
      yAxis: {
        lineWidth: 0,
        lineColor: '#ff51ff',
        gridLineColor: 'rgba(255, 255, 255, 0.1)',
        title: {
          text: 'Fee, groth',
          margin: 34,
          style: {
            'font-size': '12px',
            'font-weight': '600',
            'font-style': 'normal',
            'font-stretch': 'normal',
            'line-height': 'normal',
            'letter-spacing': '0.3px',
            'color': '#ffffff'
          }
        },
        labels: {
          style: {
            'opacity': '0.5',
            'font-size': '12px',
            'font-weight': 'normal',
            'font-style': 'normal',
            'font-stretch': 'normal',
            'line-height': 'normal',
            'letter-spacing': 'normal',
            'color': '#ffffff'
          }
        }
      },
      xAxis: {
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0,
        type: 'datetime',
        minTickInterval: chartsConsts.MILLISECONDS_IN_DAY,
        gridLineColor: 'rgba(255, 255, 255, 0.1)',
        gridLineWidth: 1,
        labels: {
          format: '{value:%b-%e}',
          style: {
            'opacity': '0.5',
            'font-size': '12px',
            'font-weight': 'normal',
            'font-style': 'normal',
            'font-stretch': 'normal',
            'line-height': 'normal',
            'letter-spacing': 'normal',
            'color': '#ffffff'
          }
        }
      },
      legend: {
        width:300,
        itemWidth: 150,
        itemMarginBottom:10,
        itemStyle: {
          width: 140,
          'font-family': 'ProximaNova',
          'font-size': '12px',
          'font-weight': 'normal',
          'font-style': 'normal',
          'font-stretch': 'normal',
          'line-height': 'normal',
          'letter-spacing': '0.5px',
          'color': '#ffffff'
        },
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        x: -40,
        y: -15
      },
      tooltip: {
        followPointer: false,
        useHTML:true,
        backgroundColor: 'rgb(80,67,89)',
        borderRadius: 10,
        borderWidth: 0,
        shadow: false,
        formatter: function () {
            let date = new Date(this.x);
            return '<div class="chart-tooltip-container">' +
              '<div class="tooltip-line-color" style="color:'+this.color+'">\u25CF</div>' +
              '<div class="tooltip-title">' + this.series.name + '</div>' +
              '<div class="tooltip-date">' + date.getDate() + ' ' +
              new Intl.DateTimeFormat('en-US', {month:"long"}).format(date) + ' ' +
              date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes() + '</div>' +
              '<div class="tooltip-value">' + this.y.toLocaleString() + '</div></div>';
        }
      },
      series: [{
        marker: {
          fillColor: 'rgba(255,255,255,0)',
          lineWidth: 2,
          radius: 1,
          symbol: 'circle',
          lineColor: null
        },
        name: 'Fee, Groth',
        color: '#00e2c2',
        data: this.chartsData.fee,
      }],
      chart: {
        float: 'left',
        width: 580,
        height: 430,
        marginBottom: 100,
        backgroundColor: 'rgba(255,255,255,0)',
        style: {
          fontFamily: 'ProximaNova',
        },
        type: 'line',
        //styledMode: true
      }
    };

    this.chartLoading = false;
    this.chartsLoaded.emit(true);
  }

  ngOnInit() {
    this.chartLoading = true;
    this.dataService.loadBlocksRange(this.chartPeriods[1].num).subscribe((data) => {
      this.constructChartsData(data);
      this.initCharts();
      this.createChart(this.chartEl.nativeElement, this.chartOptions);
      this.createChart(this.feeChartEl.nativeElement, this.feeChartOptions);
    });
  }

}
