/**
 * Test results jsx-file
 */

import React from 'react';

import { Card, CardHeader, CardMedia, CardText, CardTitle } from 'material-ui';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import { grey100, teal100, pink100, teal500, pink500 } from 'material-ui/styles/colors';
import Chart from 'chart.js'

import Moment from 'moment';


const styles = {
  cardSuccess: {
    backgroundColor: teal500
  },
  cardFailure: {
    backgroundColor: pink500
  },
  cardHeader: {
    color: '#fff'
  },
  cardMedia: {
    margin: '0 16px'
  },
  cardText: {
    backgroundColor: '#fff'
  },
  ok: {
    color: teal500
  }
}

Chart.defaults.global.defaultFontColor = '#fff';
Chart.defaults.global.defaultFontFamily = 'Roboto';

const chartData = (labels, passed, failed) => {
  return {
    labels: labels || [],
    datasets: [
      {
        label: "Failed",
        fill: true,
        backgroundColor: '#fff',
        data: failed || []
      },
      {
        label: "Passed",
        fill: true,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        data: passed || []
      },
    ]
  }
};

const chartOptions = {
  responsive: true,
  color: '#fff',
  fontFamily: 'Roboto',
  fontColor: '#ffffff',
  title: {
    display: false
  },
  legend: {
    display: false
  },
  elements: {
    line: {
      tension: 0,
      backgroundColor: '#fff',
      borderColor: '#fff',
      borderWidth: 1
    },
    point: {
      radius: 1,
      backgroundColor: '#fff',
      borderColor: '#fff'
    }
  },

  scales: {
    xAxes: [{
      gridLines: {
        color: '#fff',
        display: false
      }
    }],
    yAxes: [{
      gridLines: {
        color: '#fff',
        display: false
      },
      stacked: true,
      beginAtZero: true
    }]
  },

  //Boolean - Whether to fill the dataset with a colour
  datasetFill: true
};

export default class TestReport extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      report: {},
      chartData: chartData(),
      failures: []
    }

  }

  componentWillMount() {
    console.log('will mount');
    this.setupState(this.props);
  }

  componentDidMount() {
    const ctx = this.refs.reportChart;
    console.log('will draw chart', this.state.chartData);
    const chart = new Chart(ctx, {
      type: 'line',
      data: this.state.chartData,
      options: chartOptions
    });
  }

  componentWillUpdate() {
    const ctx = this.refs.reportChart;
    console.log('will draw chart', this.state.chartData);
    const chart = new Chart(ctx, {
      type: 'line',
      data: this.state.chartData,
      options: chartOptions
    });
  }

  componentWillReceiveProps(props) {
    console.log('did receive props');
    this.setupState(props);
  }

  setupState(props) {
    // Report model
    const report = props.report;
    const reportView = {
      title: `${report.pipeline} (${report.stage})`,
      subtitle: report.job
    };
    if (report.cucumber) {
      // Create chart history data      
      reportView.history = report.cucumber
        .reduce((acc, c) => {
          const errors = [];
          let passed = 0;
          let failed = 0;
          c.features.forEach((feature) => {
            feature.scenarios.forEach((scenario) => {
              scenario.steps.forEach((step) => {
                if (step.result === 'passed') {
                  passed++;
                } else {
                  failed++;
                  errors.push({
                    test: scenario.name,
                    message: step.error,
                  });
                }
              })
            })
          })
          acc.push({
            passed: passed,
            failed: failed,
            errors: errors,
            when: c.timestamp
          });
          return acc;
        }, [])
        // Sort by time ascending
        .sort((a, b) => {
          return a.when > b.when ? 1 : -1;
        });
      const latestTestReport = reportView.history[reportView.history.length - 1];
      reportView.failed = latestTestReport.failed > 0;

      // Chart data
      const chartDataView = chartData(
        reportView.history.map(history => Moment(history.when).fromNow(true)),
        reportView.history.map(history => history.passed),
        reportView.history.map(history => history.failed)
      );

      this.setState({
        report: reportView,
        failures: latestTestReport.errors,
        chartData: chartDataView
      })
    }
  }

  generateFailInfo() {
    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
          <TableRow>
            <TableHeaderColumn>Test</TableHeaderColumn>
            <TableHeaderColumn>Reason</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.state.failures.map((failure, idx) => {
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
    const failed = this.state.report.failed;

    return (
      <Card style={failed ? styles.cardFailure : styles.cardSuccess}>
        <CardTitle title={this.state.report.title} subtitle={this.state.report.subtitle}
          subtitleColor="rgba(255, 255, 255, 0.7)" titleColor="#fff" />
        <CardMedia style={styles.cardMedia}>
          <canvas ref="reportChart"></canvas>
        </CardMedia>
        <CardText style={styles.cardText}>
          {failed ? this.generateFailInfo() : 'Stable for 3 days'}
        </CardText>
      </Card>
    );
  }
}
