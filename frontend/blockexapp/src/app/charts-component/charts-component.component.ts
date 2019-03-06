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

  @HostListener('document:click', ['$event']) clickout(event) {
    this.isChartTypesVisible = false;
  }

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
      HASHRATE: {name: "Hashrate"},
      BLOCKS: {name: "Blocks per hour"},
      FIXED: {name: "Fixed 60 blocks"},
      BLOCKS_AVERAGE: {name: "Average blocks"}
  };

  blocksChartTypes = [
      {num: 1, name: "BLOCKS AND DIFFICULTY", tooltip: "Average difficulty", isSelected: true},
      {num: 0, name: "BLOCKS AND HASH RATE", tooltip: "Hashrate", isSelected: false}
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
    this.chartUpdate(e.num, this.charts[0], 'blocks')
  }

  feePeriodChange(e) {
    this.chartUpdate(e.num, this.charts[1], 'fee')
  }

  blocksChartTypeChange(selectedType) {
    if(!selectedType.isSelected) {
      selectedType.isSelected = true;
      this.selectedBlocksChartType.isSelected = false;
      this.selectedBlocksChartType = selectedType;

      if (selectedType.num == this.blocksChartTypes[0].num) {
        let unselectedType = this.charts[0].series.find(item => item.name == this.blocksChartTypes[1].tooltip);
        unselectedType.remove(true);

        this.charts[0].addSeries({
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
        });
      } else if (selectedType.num == this.blocksChartTypes[1].num) {
        let unselectedType = this.charts[0].series.find(item => item.name == this.blocksChartTypes[0].tooltip);
        unselectedType.remove(true);

        this.charts[0].addSeries({
          name: 'Hashrate',
          data: this.chartsData.hashrate,
          marker: {
            fillColor: 'rgba(255,255,255,0)',
            lineWidth: 2,
            radius: 1,
            symbol: 'circle',
            lineColor: null
          },
          color: '#ff51ff',
          yAxis: 1
        });
      }
    }
  }

  constructChartsData(data) {
    let initialDate = new Date(data[0].timestamp);
    let avgDifficulty = 0;
    let blocksCounter = 0, feeCounter = 0;

    data.map((item) => {
      let initialDateWithOffset = this.selectedPeriodBlocks.approximateCoefficient > 1 ? initialDate.getTime()
        + chartsConsts.MINUTE * chartsConsts.COUNT_OF_MINUTES * this.selectedPeriodBlocks.approximateCoefficient
        : initialDate.getTime() + chartsConsts.MINUTE * chartsConsts.COUNT_OF_MINUTES;

      if (new Date(item.timestamp).getTime() <= initialDateWithOffset) {
        blocksCounter++;
        feeCounter += item.fee;
        avgDifficulty += item.difficulty;
      } else {
        let timestampVal = + new Date(item.timestamp);
        let difficulty = avgDifficulty / blocksCounter;
        this.chartsData.dates.push(timestampVal);
        this.chartsData.range.push([timestampVal, this.selectedPeriodBlocks.approximateCoefficient > 1
          ? blocksCounter / this.selectedPeriodBlocks.approximateCoefficient : blocksCounter]);
        this.chartsData.difficulty.push([timestampVal, this.selectedPeriodBlocks.approximateCoefficient > 1
          ? difficulty / this.selectedPeriodBlocks.approximateCoefficient : difficulty]);
        this.chartsData.hashrate.push([timestampVal, difficulty / 60]);
        this.chartsData.fee.push([timestampVal, this.selectedPeriodBlocks.approximateCoefficient > 1 ?
          feeCounter / this.selectedPeriodBlocks.approximateCoefficient : feeCounter]);
        this.chartsData.fixedLine.push([timestampVal, chartsConsts.FIXED_BLOCKS_COORD]);
        feeCounter = item.fee;
        blocksCounter = 1;
        avgDifficulty = 0;
        initialDate = new Date(item.timestamp);
      }
    });

    let averageBlocks = this.selectedPeriodBlocks.approximateCoefficient > 1
      ? data.length / (this.chartsData.range.length * this.selectedPeriodBlocks.approximateCoefficient)
      : data.length / (this.chartsData.range.length);
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
              '<div class="tooltip-line-color" style="background-color:'+this.color+'"></div>' +
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
        width: 595,
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
              '<div class="tooltip-line-color" style="background-color:'+this.color+'"></div>' +
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
        width: 595,
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
