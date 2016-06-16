/**
 * Test results jsx-file
 */

import React from 'react';

import { Card, CardHeader, CardMedia, CardText, CardTitle } from 'material-ui';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import { grey100, teal100, pink100, teal500, pink500 } from 'material-ui/styles/colors';
import Chart from 'chart.js'

import Moment from 'moment';


const white = 'rgb(255, 255, 255)';
const transWhite = 'rgba(255, 255, 255, 0.5)';

const styles = {
  cardSuccess: {
    backgroundColor: teal500
  },
  cardFailure: {
    backgroundColor: pink500
  },
  cardHeader: {
    color: white
  },
  cardMedia: {
    margin: '16px'
  },
  cardText: {
    backgroundColor: white
  },
  ok: {
    color: teal500
  },
  tableWrapper: {
    maxHeight: 440,
    overflowY: 'auto'
  }
}

Chart.defaults.global.defaultFontColor = white;
Chart.defaults.global.defaultFontFamily = 'Roboto';

const chartData = (labels, passed, failed) => {
  return {
    labels: labels || [],
    datasets: [
      {
        label: "Failed",
        fill: true,
        backgroundColor: white,
        data: failed || []
      },
      {
        label: "Passed",
        fill: true,
        backgroundColor: transWhite,
        data: passed || []
      },
    ]
  }
};

const chartOptions = {
  responsive: true,
  title: {
    display: false
  },
  legend: {
    display: false
  },
  elements: {
    line: {
      tension: 0,
      backgroundColor: white,
      borderColor: white,
      borderWidth: 1
    },
    point: {
      radius: 1,
      backgroundColor: white,
      borderColor: white
    },
  },

  scales: {
    xAxes: [{
      gridLines: {
        drawBorder: false,
        color: white,
        display: false
      }
    }],
    yAxes: [{
      gridLines: {
        drawBorder: false,
        color: white,
        display: false
      },
      ticks: {
        maxTicksLimit: 5
      },
      stacked: true
    }]
  },

  //Boolean - Whether to fill the dataset with a colour
  datasetFill: true
};

export default class TestReport extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = this.propsToState(props);

  }

  componentDidMount() {
    // Initialize chart object
    const ctx = this.refs.reportChart;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: this.state.chartData,
      options: chartOptions
    });
  }

  componentDidUpdate() {
    this.chart.data.datasets = this.state.chartData.datasets;
    this.chart.update();
  }

  componentWillReceiveProps(props) {
    this.setState(this.propsToState(props));
  }

  /**
   * Modifies incomming properties to state object
   * 
   * @param   {Array<Object>}   props   The properties to modify
   */
  propsToState(props) {
    const report = props.report;
    const latestTestReport = report.history[report.history.length - 1];

    // Chart data
    const chartDataView = chartData(
      report.history.map(history => Moment(history.when).fromNow(true)),
      report.history.map(history => history.passed),
      report.history.map(history => history.failed)
    )
    return {
      report: report,
      latest: latestTestReport,
      chartData: chartDataView
    }
  }

  generateFailInfo(failures) {
    return (
      <Table selectable={false} wrapperStyle={styles.tableWrapper}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
          <TableRow>
            <TableHeaderColumn>Test</TableHeaderColumn>
            <TableHeaderColumn>Reason</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {failures.map((failure, idx) => {
            return (
              <TableRow key={idx}>
                <TableRowColumn title={failure.test}>{failure.test}</TableRowColumn>
                <TableRowColumn title={failure.message}>{failure.message}</TableRowColumn>
              </TableRow>
            )
          }) }
        </TableBody>
      </Table>
    )
  }

  render() {
    const report = this.state.report;
    const latest = this.state.latest;
    const failed = latest.errors.length > 0;

    return (
      <Card style={failed ? styles.cardFailure : styles.cardSuccess}>
        <CardTitle title={report.title} subtitle={report.subtitle}
          subtitleColor={transWhite} titleColor={white} />
        <CardMedia style={styles.cardMedia}>
          <canvas ref="reportChart"></canvas>
        </CardMedia>
        <CardText style={styles.cardText}>
          {failed ? this.generateFailInfo(latest.errors) : 'Stable for 3 days'}
        </CardText>
      </Card>
    );
  }
}
