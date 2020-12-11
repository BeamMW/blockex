import { Component, OnInit, AfterViewInit, ViewEncapsulation, HostListener, OnDestroy } from '@angular/core';
import { WebsocketService } from '../../../../modules/websocket';
import { WS } from '../../../../websocket.events';
import { Observable } from 'rxjs';

import { Chart } from 'angular-highcharts';

export interface IGraphs {
  items: {
    fee: number;
    difficulty: number;
    hashrate: number;
    date: string;
    blocks_count: number;
  }[];
  avg_blocks: number;
}

const LOG_MIN_VALUE = 0.001;
const DAY_TICK = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GraphsComponent implements OnInit, OnDestroy {
  private subscriber: any;
  public graphsData$: Observable<IGraphs>;
  public graphsLoaded = false;
  public graphs = {
    blocks: null,
    fee: null,
    swaps: null,
    lelantus: null 
  };
  public blockCharts = [
    {
      num: 1,
      name: 'BLOCKS AND DIFFICULTY',
      tooltip: 'Average difficulty',
      isSelected: true
    }, {
      num: 0,
      name: 'BLOCKS AND HASH RATE',
      tooltip: 'Average hash rate',
      isSelected: false
    }
  ];
  public isChartTypesVisible = false;
  public selectedBlocksChartType = this.blockCharts[0];

  @HostListener('document:click', ['$event']) clickout(event) {
    this.isChartTypesVisible = false;
  }

  constructor(private wsService: WebsocketService) {
    this.wsService.publicStatus.subscribe((isConnected) => {
      if (isConnected) {
        this.wsService.send(WS.INIT.INIT_GRAPHS);
      }
    });
    this.graphsData$ = this.wsService.on<IGraphs>(WS.INIT.INIT_GRAPHS, WS.UPDATE.UPDATE_GRAPHS);
  }

  tooltipFormatter = function() {
    const date = new Date(this.x);
    return '<div class="chart-tooltip-container">' +
      '<span class="tooltip-line-color">\u2015\u2015</span>' +
      '<div class="tooltip-line-circle"></div>' +
      '<div class="tooltip-title">' + this.series.name + '</div>' +
      '<div class="tooltip-date">' + date.getDate() + ' ' +
          new Intl.DateTimeFormat('en-US', {month: 'long'}).format(date) + ' ' +
          date.getFullYear() + ', ' + (date.getHours() < 10 ? '0' : '') + date.getHours()
          + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()  + '</div>' +
      '<div class="tooltip-value">' + this.y.toLocaleString('en-US', {maximumFractionDigits: 0}) + '</div></div>';
  };

  xAxisFormatter = function() {
    const date = new Date(this.value);
    return new Intl.DateTimeFormat('en-US', {month: 'short'}).format(date)
      + ' ' + date.getDate();
  };

  feeYAxisFormatter = function() {
    if (this.value === LOG_MIN_VALUE || this.isFirst) {
      return '0';
    }

    let res = '';
    if (this.value >= 1000) {
        const suffixes = ['', '', 'M', 'M'];
        const suffixNum = Math.floor(('' + this.value).length / 3);
        let shortValue;
        for (let precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum !== 0
              ? (this.value / Math.pow(1000, suffixNum))
              : this.value).toPrecision(precision));
            const dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 !== 0) {
          shortValue = shortValue.toFixed(1);
        }
        res = (suffixNum === 1 || suffixNum === 3 ? shortValue * 1000 : shortValue) + suffixes[suffixNum];
    }
    return res;
  };

  graphsInit(graphs): void {
    this.graphs.blocks = new Chart({
      title: {
        text: '',
      },
      chart: {
        width: 535,
        height: 430,
        ignoreHiddenSeries: false,
        type: 'line',
        styledMode: true
      },
      credits: {
          enabled: false
      },
      exporting: {
        buttons: {
          contextButton: {
              enabled: false
          }
        }
      },
      yAxis: [{
        lineColor: '#ff51ff',
        title: {
          text: 'Blocks per hour',
          margin: 24
        }
      }, {
        min: 0,
        opposite: true,
        title: {
          rotation: 270,
          text: 'Average difficulty',
          margin: 34
        }
      }],
      xAxis: {
        minorTickLength: 0,
        tickLength: 0,
        type: 'datetime',
        minTickInterval: DAY_TICK,
        labels: {
          formatter: this.xAxisFormatter,
        }
      },
      legend: {
        width: 380,
        itemWidth: 190,
        itemMarginBottom: 12,
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        x: 0,
        y: 10
      },
      tooltip: {
        followPointer: false,
        useHTML: true,
        borderRadius: 20,
        shadow: false,
        formatter: this.tooltipFormatter
      },
      series: [{
        type: 'line',
        marker: {
          radius: 2,
          symbol: 'circle',
        },
        name: 'Blocks per hour',
        color: '#24c1ff',
        data: graphs.blocks
      }, {
        type: 'line',
        marker: {
          radius: 2,
          symbol: 'circle',
        },
        name: 'Average difficulty',
        color: '#ff51ff',
        data: graphs.difficulty,
        yAxis: 1
      }, {
        type: 'line',
        marker: {
          symbol: 'circle',
          radius: 2,
          enabled: false
        },
        lineWidth: 1,
        name: 'Fixed 60 blocks',
        color: '#24c1ff',
        data: graphs.fixed
      }, {
        type: 'line',
        marker: {
          symbol: 'circle',
          radius: 2,
          enabled: false
        },
        lineWidth: 1,
        name: 'Average blocks',
        color: '#ff51ff',
        data: graphs.averageBlocks
      }],
    });

    this.graphs.fee = new Chart({
      chart: {
        styledMode: true,
        width: 535,
        height: 430,
        marginBottom: 100,
        ignoreHiddenSeries: false,
        type: 'line',
      },
      title: {
        text: ''
      },
      credits: {
          enabled: false
      },
      exporting: {
        buttons: {
          contextButton: {
              enabled: false
          }
        }
      },
      yAxis: {
        lineWidth: 0,
        type: 'logarithmic',
        title: {
          text: 'Transaction fee',
          margin: 34,
        },
        labels: {
          formatter: this.feeYAxisFormatter,
        }
      },
      xAxis: {
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0,
        type: 'datetime',
        minTickInterval: DAY_TICK,
        gridLineColor: 'rgba(255, 255, 255, 0.1)',
        gridLineWidth: 1,
        labels: {
          formatter: this.xAxisFormatter,
        }
      },
      legend: {
        width: 300,
        itemWidth: 150,
        itemMarginBottom: 10,
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        x: -10,
        y: -15
      },
      tooltip: {
        followPointer: false,
        useHTML:true,
        borderRadius: 10,
        borderWidth: 0,
        shadow: false,
        formatter: this.tooltipFormatter
      },
      series: [{
        type: 'line',
        marker: {
          radius: 2,
          symbol: 'circle'
        },
        name: 'Fee',
        data: graphs.fee,
      }],
    });

    this.graphs.swaps = new Chart({
      chart: {
        styledMode: true,
        width: 535,
        height: 430,
        marginBottom: 100,
        ignoreHiddenSeries: false,
        type: 'line',
      },
      title: {
        text: ''
      },
      credits: {
          enabled: false
      },
      exporting: {
        buttons: {
          contextButton: {
              enabled: false
          }
        }
      },
      yAxis: {
        lineWidth: 0,
        type: 'logarithmic',
        title: {
          text: 'Transaction fee',
          margin: 34,
        },
        labels: {
          formatter: this.feeYAxisFormatter,
        }
      },
      xAxis: {
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0,
        type: 'datetime',
        minTickInterval: DAY_TICK,
        gridLineColor: 'rgba(255, 255, 255, 0.1)',
        gridLineWidth: 1,
        labels: {
          formatter: this.xAxisFormatter,
        }
      },
      legend: {
        width: 300,
        itemWidth: 150,
        itemMarginBottom: 10,
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        x: -10,
        y: -15
      },
      tooltip: {
        followPointer: false,
        useHTML:true,
        borderRadius: 10,
        borderWidth: 0,
        shadow: false,
        formatter: this.tooltipFormatter
      },
      series: [{
        type: 'line',
        marker: {
          radius: 2,
          symbol: 'circle'
        },
        name: 'Fee',
        data: graphs.fee,
      }],
    });

    this.graphs.lelantus = new Chart({
      chart: {
        styledMode: true,
        width: 535,
        height: 430,
        marginBottom: 100,
        ignoreHiddenSeries: false,
        type: 'line',
      },
      title: {
        text: ''
      },
      credits: {
          enabled: false
      },
      exporting: {
        buttons: {
          contextButton: {
              enabled: false
          }
        }
      },
      yAxis: {
        lineWidth: 0,
        type: 'logarithmic',
        title: {
          text: 'Transaction fee',
          margin: 34,
        },
        labels: {
          formatter: this.feeYAxisFormatter,
        }
      },
      xAxis: {
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0,
        type: 'datetime',
        minTickInterval: DAY_TICK,
        gridLineColor: 'rgba(255, 255, 255, 0.1)',
        gridLineWidth: 1,
        labels: {
          formatter: this.xAxisFormatter,
        }
      },
      legend: {
        width: 300,
        itemWidth: 150,
        itemMarginBottom: 10,
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        x: -10,
        y: -15
      },
      tooltip: {
        followPointer: false,
        useHTML:true,
        borderRadius: 10,
        borderWidth: 0,
        shadow: false,
        formatter: this.tooltipFormatter
      },
      series: [{
        type: 'line',
        marker: {
          radius: 2,
          symbol: 'circle'
        },
        name: 'Fee',
        data: graphs.lelantus,
      }],
    });
  }

  constructGraphsData(data) {
    const graphsData = {
      blocks: [],
      difficulty: [],
      hashrate: [],
      fee: [],
      fixed: [],
      averageBlocks: [],
      lelantus: []
    };

    data.items.forEach(element => {
      const dateValue = + new Date(element.date);
      graphsData.blocks.push([dateValue, element.blocks_count]);
      graphsData.difficulty.push([dateValue, element.difficulty]);
      graphsData.fee.push([dateValue, element.fee === 0 ? LOG_MIN_VALUE : element.fee]);
      graphsData.fixed.push([dateValue, 60]);
      graphsData.hashrate.push([dateValue, element.hashrate]);
      graphsData.averageBlocks.push([dateValue, data.avg_blocks]);
    });
    graphsData.lelantus = data.lelantus;

    return graphsData;
  }

  ngOnInit(): void {
    this.subscriber = this.graphsData$.subscribe((data) => {
      const graphsConstructed = this.constructGraphsData(data);
      if (this.graphsLoaded) {
        this.graphs.blocks.ref$.subscribe((blockChart) => {
          blockChart.series[0].setData(graphsConstructed.blocks);
          blockChart.series[1].setData(graphsConstructed.difficulty);
          blockChart.series[2].setData(graphsConstructed.fixed);
          blockChart.series[3].setData(graphsConstructed.averageBlocks);
        });
      } else {
        this.graphsInit(graphsConstructed);
        this.graphsLoaded = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.graphsLoaded = false;
    this.subscriber.unsubscribe();
  }

  showTypesOptions(event): void {
    event.stopPropagation();
    this.isChartTypesVisible = !this.isChartTypesVisible;
  }

  blocksChartTypeChange(selectedType): void {
    if (!selectedType.isSelected) {
      selectedType.isSelected = true;
      this.selectedBlocksChartType.isSelected = false;
      this.selectedBlocksChartType = selectedType;
    }
  }
}
