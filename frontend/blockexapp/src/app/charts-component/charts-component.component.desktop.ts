import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {DataService} from '../services';
import {Chart} from 'chart.js';
import {Router} from "@angular/router";
import {chartsConsts} from '../consts';
import {environment} from "../../environments/environment";

import * as Highcharts from 'highcharts';

const LOG_MIN_VALUE = 0.001;

@Component({
  selector: 'app-charts-component-desktop',
  templateUrl: './charts-component.component.desktop.html',
  styleUrls: ['./charts-component.component.desktop.css']
})
export class ChartsComponentDesktop implements OnInit {
  @Input() height: any;
  @Input() fullSize: boolean;
  @Output() chartsLoaded = new EventEmitter<boolean>();
  @ViewChild('charts') public chartEl: ElementRef;
  @ViewChild('feeChart') public feeChartEl: ElementRef;

  @HostListener('document:click', ['$event']) clickout(event) {
    this.isChartTypesVisible = false;
  }

  isMainnet = environment.production;
  feeChart : any;
  chart : any;
  chartLoading : boolean = false;
  request: any;
  tempChartData: any;

  chartsData = {
      range: [],
      dates: [],
      difficulty: [],
      hashrate: [],
      fee: [],
      fixedLine: [],
      averageBlocks: []
    };

  isChartTypesVisible : boolean = false;
  chartPeriods = [
      {num: 1, name: "Day", approximateCoefficient: 1},
      {num: 7, name: "Week", approximationCoefficient: 1},
      {num: 30, name: "Month", approximateCoefficient: chartsConsts.COUNT_OF_HOURS},
      {num: 365, name: "Year", approximateCoefficient: chartsConsts.COUNT_OF_DAYS * chartsConsts.COUNT_OF_HOURS},
      {num: 0, name: "All time", approximateCoefficient: chartsConsts.COUNT_OF_DAYS * chartsConsts.COUNT_OF_HOURS}
  ];

  CHARTS = {
      DIFFICULTY: {name: "Average difficulty"},
      HASHRATE: {name: "Average hash rate"},
      BLOCKS: {name: "Blocks per hour"},
      FIXED: {name: "Fixed 60 blocks"},
      BLOCKS_AVERAGE: {name: "Average blocks"}
  };

  blocksChartTypes = [
      {num: 1, name: "BLOCKS AND DIFFICULTY", tooltip: "Average difficulty", isSelected: true},
      {num: 0, name: "BLOCKS AND HASH RATE", tooltip: "Average hash rate", isSelected: false}
  ];

  selectedPeriodBlocks = this.chartPeriods[1];
  selectedPeriodFee = this.chartPeriods[1];
  selectedBlocksChartType = this.blocksChartTypes[0];

  charts = [];
  chartOptions = {};
  feeChartOptions = {};

  constructor(
    private changeDetectionRef: ChangeDetectorRef,
    private dataService: DataService,
    private router: Router) { }

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

  chartUpdate(newRange, chart, type) {
    this.request = this.dataService.loadBlocksRange(newRange).subscribe((data) => {
      this.chartsData.range.length = 0;
      this.chartsData.dates.length = 0;
      this.chartsData.difficulty.length = 0;
      this.chartsData.hashrate.length = 0;
      this.chartsData.fee.length = 0;
      this.chartsData.fixedLine.length = 0;
      this.chartsData.averageBlocks.length = 0;

      this.constructChartsData(data);

      if(type == 'blocks') {
        chart.series.find(item => item.name == this.CHARTS.BLOCKS.name)
          .setData( this.chartsData.range, true);
        if(this.selectedBlocksChartType.num == this.blocksChartTypes[0].num) {
          chart.series.find(item => item.name == this.CHARTS.DIFFICULTY.name)
            .setData( this.chartsData.difficulty, true);
        } else if (this.selectedBlocksChartType.num == this.blocksChartTypes[1].num) {
          chart.series.find(item => item.name == this.CHARTS.HASHRATE.name)
            .setData( this.chartsData.hashrate, true);
        }
        chart.series.find(item => item.name == this.CHARTS.FIXED.name)
          .setData( this.chartsData.fixedLine, true);
        chart.series.find(item => item.name == this.CHARTS.BLOCKS_AVERAGE.name)
          .setData( this.chartsData.averageBlocks, true);
      } else {
        chart.series[0].setData( this.chartsData.fee, true);
      }
    });
  }

  showTypesOptions(event) {
    event.stopPropagation();
    this.isChartTypesVisible = !this.isChartTypesVisible;
  }

  blocksChartTypeUpdate(type) {

  }

  blocksPeriodChange(e) {
    if (this.request !== undefined) {
      this.request.unsubscribe();
    }
    this.chartUpdate(e.num, this.charts[0], 'blocks')
  }

  feePeriodChange(e) {
    if (this.request !== undefined) {
      this.request.unsubscribe();
    }
    this.chartUpdate(e.num, this.charts[1], 'fee')
  }

  blocksChartTypeChange(selectedType) {
    if(!selectedType.isSelected) {
      selectedType.isSelected = true;
      this.selectedBlocksChartType.isSelected = false;
      this.selectedBlocksChartType = selectedType;

      if (selectedType.num == this.blocksChartTypes[0].num) {
        if (this.tempChartData !== undefined) {
          this.chartsData.difficulty = this.tempChartData;
        }
        this.tempChartData = this.chartsData.hashrate.slice(0, this.chartsData.hashrate.length);
        this.charts[0].series.find(item => {
           return item.name == this.CHARTS.HASHRATE.name
        }).setData( this.chartsData.difficulty, true);
        this.charts[0].redraw();

        let unselectedType = this.charts[0].series.find(item => item.name == this.blocksChartTypes[1].tooltip);
        unselectedType.update( {name: this.CHARTS.DIFFICULTY.name});
        this.charts[0].yAxis[1].update({
            title:{
                text: this.CHARTS.DIFFICULTY.name
            }
        });
       } else if (selectedType.num == this.blocksChartTypes[1].num) {
        if (this.tempChartData !== undefined) {
          this.chartsData.hashrate = this.tempChartData;
        }
        this.tempChartData = this.chartsData.difficulty.slice(0, this.chartsData.difficulty.length);
        this.charts[0].series.find(item => {
          return item.name == this.CHARTS.DIFFICULTY.name
        }).setData( this.chartsData.hashrate, true);
        this.charts[0].redraw();

        let unselectedType = this.charts[0].series.find(item => item.name == this.blocksChartTypes[0].tooltip);
        unselectedType.update( {name: this.CHARTS.HASHRATE.name});
        this.charts[0].yAxis[1].update({
            title:{
                text: this.CHARTS.HASHRATE.name
            }
        });
      }
    }
  }

  constructChartsData(data) {
    data.items.map((item) => {
      const dateValue = + new Date(item.date);
      this.chartsData.dates.push(dateValue);
      this.chartsData.range.push([dateValue, item.blocks_count]);
      this.chartsData.difficulty.push([dateValue, item.difficulty]);
      this.chartsData.hashrate.push([dateValue, item.hashrate]);
      this.chartsData.fee.push([dateValue, item.fee]);
      this.chartsData.fixedLine.push([dateValue, item.fixed]);
      this.chartsData.averageBlocks.push([dateValue, data.avg_blocks]);
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
          margin: 24,
          style: {
            'font-size': '12px',
            'font-weight': '500',
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
            'font-weight': '500',
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
          formatter: function () {
            let date = new Date(this.value);
            return new Intl.DateTimeFormat('en-US', {month:"short"}).format(date)
              + ' ' + date.getDate();
          },
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
        backgroundColor: this.isMainnet ? 'rgb(54,85,107)' : 'rgb(80,67,89)',
        borderRadius: 10,
        borderWidth: 0,
        shadow: false,
        formatter: function () {
            let date = new Date(this.x);
            return '<div class="chart-tooltip-container">' +
              '<span class="tooltip-line-color" style="color:'+this.color+';">\u2015\u2015</span>' +
              '<div class="tooltip-line-circle" style="background-color:'+this.color+'"></div>' +
              '<div class="tooltip-title">' + this.series.name + '</div>' +
              '<div class="tooltip-date">' + date.getDate() + ' ' +
                  new Intl.DateTimeFormat('en-US', {month:"long"}).format(date) + ' ' +
                  date.getFullYear() + ', ' + (date.getHours() < 10 ? '0' : '') + date.getHours()
                  + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes()  + '</div>' +
              '<div class="tooltip-value">' + this.y.toLocaleString('en-US', {maximumFractionDigits: 0}) + '</div></div>';
        }
      },
      series: [{
        marker: {
          fillColor: 'rgba(255,255,255,0)',
          lineWidth: 2,
          radius: 1,
          symbol: 'circle',
          lineColor: '#24c1ff'
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
          lineColor: '#ff51ff'
        },
        name: 'Average difficulty',
        color: '#ff51ff',
        data: this.chartsData.difficulty,
        yAxis: 1
      }, {
        marker: {
          symbol: 'circle',
          enabled: false
        },
        lineWidth: 1,
        name: 'Fixed 60 blocks',
        color: '#24c1ff',
        data: this.chartsData.fixedLine
      }, {
        marker: {
          symbol: 'circle',
          enabled: false
        },
        lineWidth: 1,
        name: 'Average blocks',
        color: '#ff51ff',
        data: this.chartsData.averageBlocks
      }],
      chart: {
        width: 535,
        height: 430,
        marginBottom: 100,
        ignoreHiddenSeries: false,
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
        type: 'logarithmic',
        min: LOG_MIN_VALUE,
        lineColor: '#ff51ff',
        gridLineColor: 'rgba(255, 255, 255, 0.1)',
        title: {
          text: 'Transaction fee',
          margin: 34,
          style: {
            'font-size': '12px',
            'font-weight': '500',
            'font-style': 'normal',
            'font-stretch': 'normal',
            'line-height': 'normal',
            'letter-spacing': '0.3px',
            'color': '#ffffff'
          }
        },
        labels: {
          formatter: function() {
              if(this.value == LOG_MIN_VALUE || this.isFirst) {
                return 0;
              }

              if (this.value >= 1000) {
                  let suffixes = ["", "", "M", "M"];
                  let suffixNum = Math.floor( (""+this.value).length/3 );
                  let shortValue;
                  for (let precision = 2; precision >= 1; precision--) {
                      shortValue = parseFloat( (suffixNum != 0
                        ? (this.value / Math.pow(1000,suffixNum) )
                        : this.value).toPrecision(precision));
                      var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
                      if (dotLessShortValue.length <= 2) { break; }
                  }
                  if (shortValue % 1 != 0) {
                    shortValue = shortValue.toFixed(1);
                  }
                  this.value = (suffixNum == 1 || suffixNum == 3 ? shortValue*1000 : shortValue)+suffixes[suffixNum];
              }
              return this.value;
          },
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
          formatter: function () {
            let date = new Date(this.value);
            return new Intl.DateTimeFormat('en-US', {month:"short"}).format(date)
              + ' ' + date.getDate();
          },
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
        x: -10,
        y: -15
      },
      tooltip: {
        followPointer: false,
        useHTML:true,
        backgroundColor: this.isMainnet ? 'rgb(54,85,107)' : 'rgb(80,67,89)',
        borderRadius: 10,
        borderWidth: 0,
        shadow: false,
        formatter: function () {
            let date = new Date(this.x);
            return '<div class="chart-tooltip-container">' +
              '<span class="tooltip-line-color" style="color:'+this.color+';">\u2015\u2015</span>' +
              '<div class="tooltip-line-circle" style="background-color:'+this.color+'"></div>' +
              '<div class="tooltip-title">' + this.series.name + '</div>' +
              '<div class="tooltip-date">' + date.getDate() + ' ' +
              new Intl.DateTimeFormat('en-US', {month:"long"}).format(date) + ' ' +
              date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes() + '</div>' +
              '<div class="tooltip-value">' + this.y.toLocaleString('en-US', {maximumFractionDigits: 0}) + '</div></div>';
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
        name: 'Transaction fee, groths',
        color: '#00e2c2',
        data: this.chartsData.fee,
      }],
      chart: {
        float: 'left',
        width: 535,
        height: 430,
        marginBottom: 100,
        ignoreHiddenSeries: false,
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
