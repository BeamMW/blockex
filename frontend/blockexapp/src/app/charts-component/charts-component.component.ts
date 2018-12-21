import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { DataService } from '../services';
import { Chart } from 'chart.js';
import {Router} from "@angular/router";
import { chartsConsts } from '../consts';

@Component({
  selector: 'app-charts-component',
  templateUrl: './charts-component.component.html',
  styleUrls: ['./charts-component.component.css']
})
export class ChartsComponent implements OnInit {
  @Input() height: any;
  @Input() fullSize: boolean;
  @Output() chartsLoaded = new EventEmitter<boolean>();

  feeChart : any;
  chart : any;

  constructor(private dataService: DataService, private router: Router) { }

  constructChartsData(data) {
    let initialDate = new Date(data[0].timestamp);
    let chartsData = {
      range: [],
      rangeLabels: [],
      difficulty: [],
      fee: [],
      fixedLine: [],
      averageBlocks: []
    };
    let blocksCounter = 0, feeCounter = 0;
    chartsData.rangeLabels.push(initialDate);

    data.map((item) => {
      let initialDateWithOffset = initialDate.getTime()
        + chartsConsts.MINUTE * chartsConsts.COUNT_OF_MINUTES;

      if (new Date(item.timestamp).getTime() <= initialDateWithOffset) {
        blocksCounter++;
        feeCounter += item.fee;
      } else {
        chartsData.rangeLabels.push(item.timestamp);
        chartsData.range.push(blocksCounter);
        chartsData.difficulty.push(item.difficulty);
        chartsData.fee.push(feeCounter);
        feeCounter = item.fee;
        blocksCounter = 1;
        initialDate = new Date(item.timestamp);
      }
    });

    let averageBlocks = data.length / chartsData.range.length;
    chartsData.averageBlocks.length = chartsData.range.length;
    chartsData.fixedLine.length = chartsData.range.length;
    chartsData.averageBlocks.fill(averageBlocks, 0, chartsData.range.length);
    chartsData.fixedLine.fill(chartsConsts.FIXED_BLOCKS_COORD, 0, chartsData.range.length);

    return chartsData;
  }

  initCharts(chartsData) {
    this.chart = new Chart(document.getElementById("canvas"), {
      type: 'line',
      data: {
        labels: chartsData.rangeLabels,
        datasets: [{
          label: "Blocks per hour",
          data: chartsData.range,
          borderColor: "red",
          fill: false,
          yAxisID: 'y-axis-1',
        }, {
          label: "Difficulty per hour",
          data: chartsData.difficulty,
          borderColor: "green",
          fill: false,
          yAxisID: 'y-axis-2'
        }, {
          label: "Average blocks",
          data: chartsData.averageBlocks,
          borderColor: "#808080",
          radius: 0,
          borderWidth: 1,
          fill: false
        }, {
          label: "Fixed 60 blocks",
          data: chartsData.fixedLine,
          borderColor: "#F08080",
          radius: 0,
          borderWidth: 1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Blocks and Difficulty'
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: "Date"
            },
            type: 'time',
            unit: 'hour',
            unitStepSize: 24,
            minUnit: 'hour',
            time: {
              displayFormats: {
                hour: 'MMM D, h:mm A'
              }
            },
            display: true
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Blocks per hour'
            },
            id: 'y-axis-1',
            position: 'left',
            display: true
          }, {
            scaleLabel: {
              display: true,
              labelString: 'Difficulty per hour'
            },
            type: 'linear',
            display: true,
            position: 'right',
            id: 'y-axis-2',

            gridLines: {
              drawOnChartArea: false
            }
          }]
        }
      }
    });

    this.feeChart = new Chart(document.getElementById("canvas-fee"), {
      type: 'line',
      data: {
        labels: chartsData.rangeLabels,
        datasets: [{
          label: "Fee",
          data: chartsData.fee,
          borderColor: "Blue",
          fill: false
        }]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Fee'
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: "Date"
            },
            type: 'time',
            unit: 'hour',
            unitStepSize: 24,
            minUnit: 'hour',
            time: {
              displayFormats: {
                hour: 'MMM D, h:mm A'
              }
            },
            display: true
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Fee'
            },
            display: true
          }]
        }
      }
    });
    this.chartsLoaded.emit(true);
  }

  updateCharts(height) {
    this.dataService.loadBlocksRange(height - chartsConsts.COUNT_OF_BLOCK_IN_CHART,
      this.height).subscribe((data) => {
      let chartsData = this.constructChartsData(data);
      this.chart.data.datasets[0].data = chartsData.range;
      this.chart.data.labels = chartsData.rangeLabels;
      this.chart.data.datasets[1].data = chartsData.difficulty;
      this.chart.data.datasets[2].data = chartsData.averageBlocks;
      this.chart.update();

      this.feeChart.data.datasets[0].data = chartsData.fee;
      this.feeChart.data.labels = chartsData.rangeLabels;
      this.feeChart.update();
    });
  }

  ngOnInit() {
    this.dataService.loadBlocksRange(this.height - chartsConsts.COUNT_OF_BLOCK_IN_CHART,
        this.height).subscribe((data) => {
      let chartsData = this.constructChartsData(data);
      this.initCharts(chartsData);
    });
  }

}
