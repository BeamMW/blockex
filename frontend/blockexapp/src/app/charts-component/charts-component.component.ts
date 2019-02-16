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

  charts = [];
  chartOptions = {};
  feeChartOptions = {};
  chartsData : any = [];

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

  constructChartsData(data) {
    let initialDate = new Date(data[0].timestamp);
    let avgDifficulty = 0;
    let chartsData = {
      range: [],
      dates: [],
      difficulty: [],
      fee: [],
      fixedLine: [],
      averageBlocks: []
    };
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
        chartsData.dates.push(timestampVal);
        chartsData.range.push([timestampVal, blocksCounter]);
        chartsData.difficulty.push([timestampVal, avgDifficulty / blocksCounter]);
        chartsData.fee.push([timestampVal, feeCounter]);
        chartsData.fixedLine.push([timestampVal, chartsConsts.FIXED_BLOCKS_COORD]);
        feeCounter = item.fee;
        blocksCounter = 1;
        avgDifficulty = 0;
        initialDate = new Date(item.timestamp);
      }
    });

    let averageBlocks = data.length / chartsData.range.length;
    chartsData.dates.map((item) => {
      chartsData.averageBlocks.push([item, averageBlocks]);
    });

    console.log(chartsData.averageBlocks);

    return chartsData;
  }

  initCharts(chartsData) {
    this.chartOptions = {
      title: {
        text: 'BLOCKS AND DIFFICULTY',
        margin: 35,
        x: -140,
        style: {
          'font-size': '12px',
          'font-weight': '600',
          'font-style': 'normal',
          'font-stretch': 'normal',
          'line-height': 'normal',
          'letter-spacing': '0.3px',
          'text-align': 'center',
          'color': '#ffffff'
        }
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
        x: -60,
        y: 0
      },
      plotOptions: {
        series: {
          point: {
          }
        }
      },
      tooltip: {
        useHTML:true,
        //backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 0,
        shadow: false,

        /*formatter: function () {
            return 'The value for <b>' + this.x +
                '</b> is <b>' + this.y + '</b>';
        }*/
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
        color: '#ff51ff',
        data: chartsData.range
      }, {
        marker: {
          fillColor: 'rgba(255,255,255,0)',
          lineWidth: 2,
          radius: 1,
          symbol: 'circle',
          lineColor: null
        },
        name: 'Average difficulty',
        color: '#24c1ff',
        data: chartsData.difficulty,
        yAxis: 1
      }, {
        marker: {
          enabled: false
        },
        lineWidth: 1,
        name: 'Fixed 60 blocks',
        color: '#24c1ff',
        data: chartsData.fixedLine
      }, {
        marker: {
          enabled: false
        },
        lineWidth: 1,
        name: 'Average blocks',
        color: '#ff51ff',
        data: chartsData.averageBlocks
      }],
      chart: {
        height: 480,
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
        text: 'FEE',
        margin: 35,
        x: -190,
        style: {
          'font-size': '12px',
          'font-weight': '600',
          'font-style': 'normal',
          'font-stretch': 'normal',
          'line-height': 'normal',
          'letter-spacing': '0.3px',
          'text-align': 'center',
          'color': '#ffffff'
        }
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
        x: -60,
        y: 0
      },
      plotOptions: {
        series: {
          //pointStart: 2010,
          point: {
          }
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
        data: chartsData.fee,
      }],
      chart: {
        float: 'left',
        height: 480,
        marginBottom: 100,
        backgroundColor: 'rgba(255,255,255,0)',
        style: {
          fontFamily: 'ProximaNova',
        },
        type: 'line',
        //styledMode: true
      }
    };
  }

  ngOnInit() {
    this.dataService.loadBlocksRange().subscribe((data) => {
      let chartsData = this.constructChartsData(data);
      this.initCharts(chartsData);
      this.createChart(this.chartEl.nativeElement, this.chartOptions);
      this.createChart(this.feeChartEl.nativeElement, this.feeChartOptions);
    });
  }

}
