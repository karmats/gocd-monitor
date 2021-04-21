/**
 * Test results jsx-file
 */

import React from 'react';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import teal from '@material-ui/core/colors/teal';
import pink from '@material-ui/core/colors/pink';
import Clear from '@material-ui/icons/Clear';

import { Chart } from 'chart.js'
import moment from 'moment';


// White and transparent white colors
const white = 'rgb(255, 255, 255)';
const black = 'rgb(0, 0, 0)';
const transWhite = 'rgba(255, 255, 255, 0.5)';

// Style css
const styles = {
  cardSuccess: {
    backgroundColor: teal["500"]
  },
  cardFailure: {
    backgroundColor: pink["500"]
  },
  cardContainer: {
    paddingBottom: 0
  },
  cardMedia: {
    margin: '16px'
  },
  cardText: {
    backgroundColor: white,
    color: black
  },
  cardTitle: {
    color: white
  },
  cardSubtitle: {
    color: transWhite
  },
  cardActions: {
    float: 'right',
    marginRight: -10
  }
}

// Chart.js setup
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
      radius: 2,
      backgroundColor: white,
      borderColor: white
    },
  },

  scales: {
    xAxes: [{
      type: 'time',
      time: {
        unit: 'hour',
        displayFormats: {
          hour: 'ddd, MMM D'
        },
        unitStepSize: 24,
        tooltipFormat: 'dddd, MMMM Do YYYY, h:mm:ss a'
      },
      gridLines: {
        drawBorder: false,
        color: white,
        display: false
      },
      ticks: {
        callback: (value, idx, values) => {
          // To avoid duplicates
          const stringVals = values.map(val => {
            moment(val.value).format('ddd, MMM D')
          });
          if (stringVals.indexOf(value) !== idx) {
            return '';
          }
          return value;
        }
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
  datasetFill: true
}

export default class TestReport extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = this.propsToState(props);

  }

  componentDidMount() {
    // Initialize chart object
    const ctx = this.refs.reportChart;

    const chartOpts = chartOptions;
    chartOpts.scales.xAxes[0].time.min = this.state.first.when;
    chartOpts.scales.xAxes[0].time.max = this.state.latest.when;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: this.state.chartData,
      options: chartOpts
    });
  }

  componentDidUpdate() {
    this.chart.data.datasets = this.state.chartData.datasets;
    this.chart.data.labels = this.state.chartData.labels;

    this.chart.options.scales.xAxes[0].time.min = this.state.first.when;
    this.chart.options.scales.xAxes[0].time.max = this.state.latest.when;
    this.chart.update();
  }

  componentWillReceiveProps(props) {
    this.setState(this.propsToState(props));
  }

  /**
   * Modifies incomming properties to state object
   * 
   * @param   {Object}   props   The properties to modify
   */
  propsToState(props) {
    const report = props.report;
    const latestTestReport = report.history[report.history.length - 1];
    const firstTestReport = report.history[0];

    // Chart data
    const chartDataView = chartData(
      report.history.map(history => history.when),
      report.history.map(history => history.passed),
      report.history.map(history => history.failed)
    )

    return {
      report: report,
      latest: latestTestReport,
      first: firstTestReport,
      chartData: chartDataView
    }
  }

  /**
   * Tests that has failed in a table 
   * 
   * @param {Array<Object>}   failures  Failed object array
   */
  generateFailInfo(failures) {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Test</TableCell>
            <TableCell>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {failures.map((failure, idx) => {
            return (
              <TableRow key={idx} hover>
                <TableCell title={failure.test}>{failure.test}</TableCell>
                <TableCell title={failure.message}>{failure.message}</TableCell>
              </TableRow>
            )
          }) }
        </TableBody>
      </Table>
    )
  }

  render() {
    const { report, latest } = this.state;
    const failed = latest.errors.length > 0;

    // String that tells how long the test has been stable
    let stableDays = '';
    if (!failed) {
      const lastFailedIdx = report.history.reduce((p, c, idx) => {
        if (c.failed > 0 && p < idx) {
          return idx;
        }
        return p;
      }, -1);
      const passedAfterFailed = report.history[lastFailedIdx + 1];
      stableDays = lastFailedIdx >= 0 && passedAfterFailed
        ? `Stable for ${moment(passedAfterFailed.when).fromNow(true)}`
        : 'Super stable!'
    }

    // Remove test action
    const actions = this.props.admin ? (
      <CardActions style={styles.cardActions}>
        <Button title="Remove test" color="inherit" onClick={this.props.onRemoveTest.bind(this, report) }>
          <Clear color="inherit" />
        </Button>
      </CardActions>) : null;

    return (
      <Card style={failed ? styles.cardFailure : styles.cardSuccess}>
        {actions}
        <CardHeader title={report.title} subheader={report.subtitle} titleTypographyProps={{ noWrap: true, style: styles.cardTitle }}
          subheaderTypographyProps={{ style: styles.cardSubtitle }} />
        <CardMedia style={styles.cardMedia} src="#">
          <canvas ref="reportChart"></canvas>
        </CardMedia>
        <CardContent style={styles.cardText}>
          {failed ? this.generateFailInfo(latest.errors) : stableDays}
        </CardContent>
      </Card>
    );
  }
}
