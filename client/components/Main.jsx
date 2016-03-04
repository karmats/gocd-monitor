/**
 * In this file, we create a React component
 * which incorporates components providedby material-ui.
 */

import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import { Card, CardHeader, CardText } from 'material-ui/lib/card';
import Colors from 'material-ui/lib/styles/colors';
import Moment from 'moment';
import FlatButton from 'material-ui/lib/flat-button';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import { Line as LineChart } from 'react-chartjs';
import TestComponent from './TestComponent';

const pipelines = {
    "pipelines": [
        {
            "id": "scx-4.1",
            "status": "success",
            "buildtime": 1457085089646,
            "build": ["#102", "#103", "#104", "#105", "#106"],
            "tests": [100, 100, 102, 105, 105],
            "success": [89, 90, 102, 100, 105],
            "error": [11, 10, 0, 5, 0]
        },
        {
            "id": "scx-5.0",
            "status": "failed",
            "buildtime": 1318781876406,
            "build": ["#202", "#203", "#204", "#205", "#206"],
            "tests": [125, 125, 127, 130, 130],
            "success": [125, 120, 120, 127, 130],
            "error": [0, 5, 7, 3, 0]
        }
    ]
}

const styles = {
  container: {
    textAlign: 'left',
    padding: 20,
    color: '#fff'
  },
  cardSuccess: {
    color: '#fff',
    background: Colors.green500,
    fontSize: '1.2em'
  },
  cardSuccessSub: {
    color: '#fff',
    fontSize: '1em',
    fontWeight: 100
  },
  cardFailure: {
    color: '#fff',
    background: Colors.red500
  },
  fab: {
    position: 'absolute',
    right: 50,
    bottom: 50
  }
};

const chartOptions = {

    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : false,

    //String - Colour of the grid lines
    scaleGridLineColor : "#fff",

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
    pointDot : false,

    //Number - Radius of each point dot in pixels
    pointDotRadius : 4,

    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth : 1,

    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius : 20,

    //Boolean - Whether to show a stroke for datasets
    datasetStroke : false,

    //Number - Pixel width of dataset stroke
    datasetStrokeWidth : 1,

    //Boolean - Whether to fill the dataset with a colour
    datasetFill : true,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

};

const muiTheme = getMuiTheme({
  palette: {
     accent1Color: Colors.purple700
   } 
});

export default class Main extends React.Component {
  constructor(props, context) {
    super(props, context);

    // Setup event handlers
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.handleTouchTap = this.handleTouchTap.bind(this);

    // Setup initial state
    this.state = {
      open: false
    };
  }

  chartData() {
    return pipelines.pipelines.map((pipeline) => {
      let data = {};
      data.name = pipeline.id;
      data.labels = pipeline.build;
      data.datasets = [];
      // Success
      data.datasets[0] = {
        label: "Success",
        fillColor: "rgba(255,255,255,0.5)",
        strokeColor: "#fff",
        pointColor: "#fff",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "#fff",
        data: pipeline.success
      };
      // Errors
      data.datasets[1] = {
        label: "Errors",
        fillColor: "#fff",
        strokeColor: "#fff",
        pointColor: "#fff",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "#fff",
        data: pipeline.error
      };
      return data;
    });
  };

  generateChartDOM() {
    return this.chartData().map((cd, idx) => {
      return (
        <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
          <Card style={styles.cardSuccess}>
            <CardHeader
              title={cd.name}
              titleStyle={styles.cardSuccess}
              subtitle="finished"
              subtitleStyle={styles.cardSuccessSub}>
              <i className="mdi mdi-weather-sunny mdi-48px buildstatus"></i>
            </CardHeader>
            <CardText>
              <div className="buildinfo">
                <div>
                  <i className="mdi mdi-clock mdi-24px"></i>
                  <span>{ Moment(cd.buildtime).fromNow() }</span>
                </div>
                <div>
                  <i className="mdi mdi-worker mdi-24px"></i>
                  <span>Mats R</span>
                </div>
              </div>
            </CardText>
          </Card>
        </div>
        )
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  handleTouchTap() {
    this.setState({
      open: true,
    });
  }

  render() {
    const standardActions = (
      <FlatButton
        label="Okey"
        secondary={true}
        onTouchTap={this.handleRequestClose}
      />
    );

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={styles.container}>
          <div className="row">
            {this.generateChartDOM()}
          </div>
          <Dialog
            open={this.state.open}
            title="Super Secret Password"
            actions={standardActions}
            onRequestClose={this.handleRequestClose}>
            1-2-3-4-5
          </Dialog>
          <FloatingActionButton style={styles.fab}
            primary={true}
            onTouchTap={this.handleTouchTap}>
           <ContentAdd />
         </FloatingActionButton>
        </div>
      </MuiThemeProvider>
    );
  }
}
