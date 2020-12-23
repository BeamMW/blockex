import { Component, OnInit, AfterViewInit, ViewEncapsulation, SimpleChanges, Input, HostListener, OnDestroy } from '@angular/core';
import { WebsocketService } from '../../../../modules/websocket';
import { WS } from '../../../../websocket.events';
import { Observable } from 'rxjs';
import { currencies } from '../../../../consts';

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
  @Input() activeCurrency: string;

  private subscriber: any;
  public graphsData$: Observable<IGraphs>;
  public graphsLoaded = false;
  public graphs = {
    blocks: null,
    fee: null,
    swaps: null,
    lelantus: null,
    transactions: null 
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

  public trCharts = [
    {
      num: 1,
      name: 'OFFERED VOLUME',
      isSelected: true
    }, {
      num: 0,
      name: 'TRANSACTIONS AMOUNT',
      isSelected: false
    }
  ];
  public isChartTypesVisible = false;
  public isChartTypesSecondVisible = false;
  public selectedBlocksChartType = this.blockCharts[0];
  public selectedTrChartType = this.trCharts[0];
  private lastConstructedGraphs: any;

  @HostListener('document:click', ['$event']) clickout(event) {
    this.isChartTypesVisible = false;
    this.isChartTypesSecondVisible = false;
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
        shadow: false,
        width: 610,
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
          enabledThreshold: 0,
          radius: 2,
          symbol: 'circle',
        },
        name: 'Blocks per hour',
        data: graphs.blocks
      }, {
        type: 'line',
        marker: {
          enabledThreshold: 0,
          radius: 2,
          symbol: 'circle',
        },
        name: 'Average difficulty',
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
        data: graphs.averageBlocks
      }],
    });

    this.graphs.fee = new Chart({
      chart: {
        shadow: false,
        styledMode: true,
        width: 610,
        height: 430,
        marginBottom: 100,
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
          text: 'Transaction Fee, GROTH',
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
          enabledThreshold: 0,
          radius: 2,
          symbol: 'circle'
        },
        name: 'Fee',
        data: graphs.fee,
      }],
    });

    this.graphs.swaps = new Chart({
      title: {
        text: '',
      },
      chart: {
        shadow: false,
        width: 610,
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
        title: {
          text: 'Amount, USD',
          margin: 24
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
        width: 450,
        itemWidth: 90,
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
          enabledThreshold: 0,
          radius: 2,
          symbol: 'circle',
        },
        name: 'BTC',
        data: graphs.swaps_btc_usd
      }, {
        type: 'line',
        marker: {
          enabledThreshold: 0,
          radius: 2,
          symbol: 'circle',
        },
        name: 'DASH',
        data: graphs.swaps_dash_usd
      }, {
        type: 'line',
        marker: {
          enabledThreshold: 0,
          symbol: 'circle',
          radius: 2,
        },
        name: 'DOGE',
        data: graphs.swaps_doge_usd
      }, {
        type: 'line',
        marker: {
          enabledThreshold: 0,
          symbol: 'circle',
          radius: 2,
        },
        name: 'LTC',
        data: graphs.swaps_ltc_usd
      }, {
        type: 'line',
        marker: {
          enabledThreshold: 0,
          symbol: 'circle',
          radius: 2,
        },
        name: 'QTUM',
        data: graphs.swaps_qtum_usd
      }],
    });

    this.graphs.lelantus = new Chart({
      title: {
        text: '',
      },
      chart: {
        shadow: false,
        width: 610,
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
          text: 'Time, Hours',
          margin: 24
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
          enabledThreshold: 0,
          radius: 2,
          symbol: 'circle',
        },
        name: 'Average time',
        data: graphs.lelantus
      }],
    });

    this.graphs.transactions = new Chart({
      title: {
        text: '',
      },
      chart: {
        shadow: false,
        width: 610,
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
        title: {
          text: 'Transactions amount',
          margin: 24
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
        width: 450,
        itemWidth: 90,
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
          enabledThreshold: 0,
          radius: 2,
          symbol: 'circle',
        },
        name: 'Regular',
        data: graphs.transactions
      }, {
        type: 'line',
        marker: {
          enabledThreshold: 0,
          radius: 2,
          symbol: 'circle',
        },
        name: 'Shielded',
        data: graphs.lelantus_trs
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
      lelantus: [],
      swaps_btc_usd: [],
      swaps_dash_usd: [],
      swaps_doge_usd: [],
      swaps_ltc_usd: [],
      swaps_qtum_usd: [],
      swaps_btc_btc: [],
      swaps_dash_btc: [],
      swaps_doge_btc: [],
      swaps_ltc_btc: [],
      swaps_qtum_btc: [],
      transactions: [],
      lelantus_trs: []
    };

    data.items.forEach(element => {
      const dateValue = + new Date(element.date);
      graphsData.blocks.push([dateValue, element.blocks_count]);
      graphsData.difficulty.push([dateValue, element.difficulty]);
      graphsData.fee.push([dateValue, element.fee === 0 ? LOG_MIN_VALUE : element.fee]);
      graphsData.fixed.push([dateValue, 60]);
      graphsData.hashrate.push([dateValue, element.hashrate]);
      graphsData.averageBlocks.push([dateValue, data.avg_blocks]);
      graphsData.transactions.push([dateValue, element.transactions.kernels__count])
    });

    data.lelantus.forEach(element => {
      const dateValue = + new Date(element[0]);
      graphsData.lelantus.push([dateValue, parseFloat(element[1])])
    });

    data.lelantus_trs.forEach(element => {
      const dateValue = + new Date(element[0]);
      graphsData.lelantus_trs.push([dateValue, parseFloat(element[1])])
    });

    data.swap_stats.forEach(element => {
      const dateValue = + new Date(element[0]);
      graphsData.swaps_btc_usd.push([dateValue, parseFloat(element[1].usd.bitcoin)]);
      graphsData.swaps_dash_usd.push([dateValue, parseFloat(element[1].usd.dash)]);
      graphsData.swaps_doge_usd.push([dateValue, parseFloat(element[1].usd.dogecoin)]);
      graphsData.swaps_ltc_usd.push([dateValue, parseFloat(element[1].usd.litecoin)]);
      graphsData.swaps_qtum_usd.push([dateValue, parseFloat(element[1].usd.qtum)]);

      graphsData.swaps_btc_btc.push([dateValue, parseFloat(element[1].btc.bitcoin)]);
      graphsData.swaps_dash_btc.push([dateValue, parseFloat(element[1].btc.dash)]);
      graphsData.swaps_doge_btc.push([dateValue, parseFloat(element[1].btc.dogecoin)]);
      graphsData.swaps_ltc_btc.push([dateValue, parseFloat(element[1].btc.litecoin)]);
      graphsData.swaps_qtum_btc.push([dateValue, parseFloat(element[1].btc.qtum)]);
    });

    this.lastConstructedGraphs = JSON.parse(JSON.stringify(graphsData));
    return graphsData;
  }

  ngOnInit(): void {
    this.subscriber = this.graphsData$.subscribe((data) => {
      const graphsConstructed = this.constructGraphsData(data);
      if (this.graphsLoaded) {
        this.graphs.blocks.ref$.subscribe((blockChart) => {
          blockChart.series[0].setData(graphsConstructed.blocks);
          if (this.selectedBlocksChartType.num == this.blockCharts[0].num) {
            blockChart.series[1].setData(graphsConstructed.difficulty);
          } else {
            blockChart.series[1].setData(graphsConstructed.hashrate);
          }
          blockChart.series[2].setData(graphsConstructed.fixed);
          blockChart.series[3].setData(graphsConstructed.averageBlocks);
        });

        this.graphs.fee.ref$.subscribe((feeChart) => {
          feeChart.series[0].setData(graphsConstructed.fee);
        });

        this.graphs.lelantus.ref$.subscribe((lelChart) => {
          lelChart.series[0].setData(graphsConstructed.lelantus);
        });

        this.graphs.transactions.ref$.subscribe((trChart) => {
          trChart.series[0].setData(graphsConstructed.transactions);
          trChart.series[1].setData(graphsConstructed.lelantus_trs);
        });

        if (this.activeCurrency === currencies.BTC) {
          this.graphs.swaps.ref$.subscribe((swapsChart) => {
            swapsChart.series[0].setData(graphsConstructed.swaps_btc_btc);
            swapsChart.series[1].setData(graphsConstructed.swaps_dash_btc);
            swapsChart.series[2].setData(graphsConstructed.swaps_doge_btc);
            swapsChart.series[3].setData(graphsConstructed.swaps_ltc_btc);
            swapsChart.series[4].setData(graphsConstructed.swaps_qtum_btc);
          });
        } else if (this.activeCurrency === currencies.USD) {
          this.graphs.swaps.ref$.subscribe((swapsChart) => {
            swapsChart.series[0].setData(graphsConstructed.swaps_btc_usd);
            swapsChart.series[1].setData(graphsConstructed.swaps_dash_usd);
            swapsChart.series[2].setData(graphsConstructed.swaps_doge_usd);
            swapsChart.series[3].setData(graphsConstructed.swaps_ltc_usd);
            swapsChart.series[4].setData(graphsConstructed.swaps_qtum_usd);
          });
        }
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

  ngOnChanges(changes: SimpleChanges) {
    const value = changes.activeCurrency.currentValue;
    if (value !== undefined) {
      if (value === currencies.BTC) {
        this.graphs.swaps.ref$.subscribe((swapsChart) => {
          swapsChart.series[0].setData(this.lastConstructedGraphs.swaps_btc_btc);
          swapsChart.series[1].setData(this.lastConstructedGraphs.swaps_dash_btc);
          swapsChart.series[2].setData(this.lastConstructedGraphs.swaps_doge_btc);
          swapsChart.series[3].setData(this.lastConstructedGraphs.swaps_ltc_btc);
          swapsChart.series[4].setData(this.lastConstructedGraphs.swaps_qtum_btc);
          swapsChart.yAxis[0].update({
            title:{
                text: "Amount, BTC"
            }
          });
          swapsChart.redraw();
        });
      } else if (value === currencies.USD) {
        this.graphs.swaps.ref$.subscribe((swapsChart) => {
          swapsChart.series[0].setData(this.lastConstructedGraphs.swaps_btc_usd);
          swapsChart.series[1].setData(this.lastConstructedGraphs.swaps_dash_usd);
          swapsChart.series[2].setData(this.lastConstructedGraphs.swaps_doge_usd);
          swapsChart.series[3].setData(this.lastConstructedGraphs.swaps_ltc_usd);
          swapsChart.series[4].setData(this.lastConstructedGraphs.swaps_qtum_usd);
          swapsChart.yAxis[0].update({
            title:{
                text: "Amount, USD"
            }
          });
          swapsChart.redraw();
        });
      }
    }
  }

  showTypesSecondOptions(event) {
    event.stopPropagation();
    this.isChartTypesSecondVisible = !this.isChartTypesSecondVisible;
  }

  trChartTypeChange(selectedType) {
    if (!selectedType.isSelected) {
      selectedType.isSelected = true;
      this.selectedTrChartType.isSelected = false;
      this.selectedTrChartType = selectedType;
    }
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

      if (selectedType.num == this.blockCharts[0].num) {
        this.graphs.blocks.ref$.subscribe((blockChart) => {
          blockChart.series[1].setData(this.lastConstructedGraphs.difficulty);
          blockChart.update({
            name: "Average difficulty"
          });
          blockChart.yAxis[1].update({
              title:{
                  text: "Average difficulty"
              }
          });
          blockChart.legend.allItems[1].update({
            name: "Average difficulty"
          });
          blockChart.redraw();
        });
      } else if (selectedType.num == this.blockCharts[1].num) {
        this.graphs.blocks.ref$.subscribe((blockChart) => {
          blockChart.series[1].setData(this.lastConstructedGraphs.hashrate);
          blockChart.update({
            name: "Average hash rate"
          });
          blockChart.yAxis[1].update({
              title:{
                  text: "Average hash rate"
              }
          });
          blockChart.legend.allItems[1].update({
            name: "Average hash rate"
          });
          blockChart.redraw();
        });
      }
    }
  }
}
