/**
 * Test results jsx-file
 */

import React from 'react';

import { Card, CardHeader, CardMedia, CardText, CardTitle } from 'material-ui';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import { grey100, teal100, pink100, teal500, pink500 } from 'material-ui/styles/colors';
import { Line as LineChart } from 'react-chartjs';

import Moment from 'moment';


const styles = {
  cardSuccess: {
    backgroundColor: teal500,
    marginBottom: '1rem' 
  },
  cardFailure: {
    backgroundColor: pink500,
    marginBottom: '1rem'
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

const chartData = (labels, passed, failed) => {
  return {
    labels: labels || [],
    datasets: [
      {
        label: "Passed",
        fillColor: 'rgba(255, 255, 255, 0.5)',
        strokeColor: '#fff',
        pointColor: '#fff',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: '#fff',
        data: passed || []
      },
      {
        label: "Failed",
        fillColor: '#fff',
        strokeColor: '#fff',
        pointColor: '#fff',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: '#fff',
        data: failed || []
      }
    ]
  }
};

const chartOptions = {
    responsive : true,

    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : false,
    
    scaleLineColor: '#fff',
    scaleFontColor: '#fff',

    //String - Colour of the grid lines
    scaleGridLineColor : '#fff',

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: false,

    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: false,

    //Boolean - Whether the line is curved between points
    bezierCurve : false,

    //Number - Tension of the bezier curve between points
    bezierCurveTension : 0.4,

    //Boolean - Whether to show a dot for each point
    pointDot : false,

    //Number - Radius of each point dot in pixels
    pointDotRadius : 1,

    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth : 0,

    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius : 20,

    //Boolean - Whether to show a stroke for datasets
    datasetStroke : true,

    //Number - Pixel width of dataset stroke
    datasetStrokeWidth : 1,

    //Boolean - Whether to fill the dataset with a colour
    datasetFill : true
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

  componentDidMount() {
    // Report model
    const report = this.props.report;
    const reportView = {
      title: `${report.pipeline} (${report.stage})`,
      subtitle: report.job
    };
    if (report.cucumber) {
      const failures = [];
      // Create chart history data      
      reportView.history = report.cucumber
      .reduce((acc, c) => {
        let passed = 0;
        let failed = 0;
        c.features.forEach((feature) => {
          feature.scenarios.forEach((scenario) => {
            scenario.steps.forEach((step) => {
              if (step.result === 'passed') {
                passed++;
              } else {
                failed++;
                failures.push({
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
          when: c.timestamp
        });
        return acc;
      }, [])
      // Sort by time ascending
      .sort((a, b) => {
        return a.timestamp > b.timestamp ? -1 : 1;
      });
      reportView.failed = reportView.history.some(history => history.failed > 0)

      // Chart data
      const chartDataView = chartData(
        reportView.history.map(history => Moment(history.when).fromNow()),
        reportView.history.map(history => history.passed + history.failed),
        reportView.history.map(history => history.failed)
      );

      this.setState({
        report: reportView,
        failures: failures,
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
          {this.state.failures.map((failure) => {
            return (
              <TableRow>
                <TableRowColumn title={failure.test}>{failure.test}</TableRowColumn>
                <TableRowColumn title={failure.message}>{failure.message}</TableRowColumn>
              </TableRow>
            )
          })}
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
          <LineChart data={this.state.chartData} options={chartOptions} redraw />
        </CardMedia>
        <CardText style={styles.cardText}>
          {failed ? this.generateFailInfo() : 'Stable for 3 days'}
        </CardText>
      </Card>
    );
  }
}
