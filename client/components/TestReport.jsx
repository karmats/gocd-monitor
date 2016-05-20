/**
 * Test results jsx-file
 */

import React from 'react';

import { Card, CardHeader, CardMedia, CardText } from 'material-ui';
import { grey100, green100, red100, green500, red500 } from 'material-ui/styles/colors';
import { Line as LineChart } from 'react-chartjs';


const styles = {
  card : {
    marginBottom: '1rem'
  },
  cardMedia: {
    margin: '0 16px'
  },
  ok: {
    color: green500
  }
}

const chartData = {
    labels: ["101", "102", "103", "104", "105", "106", "107"],
    datasets: [
        {
            label: "Passed",
            fillColor: green100,
            strokeColor: green500,
            pointColor: green500,
            pointStrokeColor: green500,
            pointHighlightFill: green500,
            pointHighlightStroke: green500,
            data: [65, 64, 67, 67, 70, 70, 71]
        },
        {
            label: "Failed",
            fillColor: red100,
            strokeColor: red500,
            pointColor: red500,
            pointStrokeColor: red500,
            pointHighlightFill: red500,
            pointHighlightStroke: red500,
            data: [0, 1, 10, 0, 0, 2, 3]
        }
    ]
};

const chartOptions = {
    responsive : true,

    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : false,

    //String - Colour of the grid lines
    scaleGridLineColor : grey100,

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: false,

    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: false,

    //Boolean - Whether the line is curved between points
    bezierCurve : true,

    //Number - Tension of the bezier curve between points
    bezierCurveTension : 0.4,

    //Boolean - Whether to show a dot for each point
    pointDot : true,

    //Number - Radius of each point dot in pixels
    pointDotRadius : 1,

    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth : 0,

    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius : 20,

    //Boolean - Whether to show a stroke for datasets
    datasetStroke : true,

    //Number - Pixel width of dataset stroke
    datasetStrokeWidth : 2,

    //Boolean - Whether to fill the dataset with a colour
    datasetFill : true
};

export default class TestReport extends React.Component {
  
  constructor(props, context) {
    super(props, context);
  }
  
  render() {

    return (
      <Card style={styles.card}>
        <CardHeader title={this.props.report}  />
        <CardMedia style={styles.cardMedia}>
          <LineChart data={chartData} options={chartOptions} />
        </CardMedia>
        <CardText>
          All is good
        </CardText>
      </Card>
    );
  }
}
