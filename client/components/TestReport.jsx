/**
 * Test results jsx-file
 */

import React from 'react';

import { Card, CardHeader, CardMedia, CardText } from 'material-ui';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import { grey100, teal100, pink100, teal500, pink500 } from 'material-ui/styles/colors';
import { Line as LineChart } from 'react-chartjs';


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

const chartData = {
    labels: ["101", "102", "103", "104", "105", "106", "107"],
    datasets: [
        {
            label: "Passed",
            fillColor: 'rgba(255, 255, 255, 0.5)',
            strokeColor: '#fff',
            pointColor: '#fff',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: '#fff',
            data: [65, 64, 67, 67, 70, 70, 71]
        },
        {
            label: "Failed",
            fillColor: '#fff',
            strokeColor: '#fff',
            pointColor: '#fff',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: '#fff',
            data: [0, 1, 10, 0, 0, 2, 3]
        }
    ]
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
  }

  generateFailInfo(report) {
    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
          <TableRow>
            <TableHeaderColumn>Test</TableHeaderColumn>
            <TableHeaderColumn>Reason</TableHeaderColumn>
            <TableHeaderColumn>Blame</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn>Button click</TableRowColumn>
            <TableRowColumn>Expect 1 to be 2</TableRowColumn>
            <TableRowColumn>Mats Roshauw</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>Fetch all metadata</TableRowColumn>
            <TableRowColumn>Exception</TableRowColumn>
            <TableRowColumn>Per Arneng</TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    )
  }
  render() {
    const success = Math.random() > 0.5;

    return (
      <Card style={success ?  styles.cardSuccess : styles.cardFailure}>
        <CardHeader title={this.props.report} titleColor="#fff" />
        <CardMedia style={styles.cardMedia}>
          <LineChart data={chartData} options={chartOptions} />
        </CardMedia>
        <CardText style={styles.cardText}>
          {success ? 'All is good' : this.generateFailInfo()}
        </CardText>
      </Card>
    );
  }
}
