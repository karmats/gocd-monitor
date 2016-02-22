/**
 * In this file, we create a React component
 * which incorporates components providedby material-ui.
 */

import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import Colors from 'material-ui/lib/styles/colors';
import FlatButton from 'material-ui/lib/flat-button';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import { Line as LineChart } from 'react-chartjs';
import { Responsive, WidthProvider } from 'react-grid-layout';
import TestComponent from './TestComponent';
import pipelines from 'json!../../assets/data/pipelines.json';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const styles = {
  container: {
  },
  fab: {
    position: 'absolute',
    right: 50,
    bottom: 50
  }
};

const chartOptions = {

    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : true,

    //String - Colour of the grid lines
    scaleGridLineColor : "rgba(0,0,0,.05)",

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,

    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,

    //Boolean - Whether the line is curved between points
    bezierCurve : true,

    //Number - Tension of the bezier curve between points
    bezierCurveTension : 0.4,

    //Boolean - Whether to show a dot for each point
    pointDot : true,

    //Number - Radius of each point dot in pixels
    pointDotRadius : 4,

    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth : 1,

    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius : 20,

    //Boolean - Whether to show a stroke for datasets
    datasetStroke : true,

    //Number - Pixel width of dataset stroke
    datasetStrokeWidth : 2,

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
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.handleTouchTap = this.handleTouchTap.bind(this);

    this.state = {
      open: false,
      layout: this.generateLayout()
    };
    this.props = {
      className: "layout",
      rowHeight: 30,
      cols: {
        lg: 12, md: 10, sm: 6, xs: 4, xxs: 2
      }
    }
  }

  chartData() {
    return pipelines.pipelines.map((pipeline) => {
      let data = {};
      data.labels = pipeline.build;
      data.datasets = [];
      // Success
      data.datasets[0] = {
        label: "Success",
        fillColor: Colors.green500,
        strokeColor: Colors.green600,
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: pipeline.success
      };
      // Errors
      data.datasets[1] = {
        label: "Errors",
        fillColor: Colors.red500,
        strokeColor: Colors.red600,
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: pipeline.error
      };
      return data;
    });
  };

  generateDOM() {
    return this.chartData().map((cd, idx) => {
      return (
        <div key={idx}>
          <LineChart data={cd} options={chartOptions} width="300" height="125" />
        </div>
        )
    });
  }

  generateLayout() {
    var p = this.props;
    return pipelines.pipelines.map((item, i) => {
      return {x: i*2, y: 0, w: 2, h: 2, i: i.toString()};
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
         <ResponsiveReactGridLayout layout={this.state.layout}
            {...this.props}>
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
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
