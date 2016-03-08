/**
 * In this file, we create a React component
 * which incorporates components providedby material-ui.
 */

import React from 'react';
import { CircularProgress, Dialog, FlatButton, FloatingActionButton } from 'material-ui/lib';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import { Card, CardHeader, CardText } from 'material-ui/lib/card';
import Colors from 'material-ui/lib/styles/colors';
import Moment from 'moment';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import TestComponent from './TestComponent';

const pipelines = [
        {
            "id": "scx-back-4.1",
            "status": "passed",
            "buildtime": 1457085089646,
        },
        {
            "id": "scx-gui-4.1",
            "status": "passed",
            "buildtime": 1457359890796
        },
        {
            "id": "scx-back-5.0",
            "status": "failed",
            "buildtime": 1318781876406
        },
        {
            "id": "scx-gui-5.0",
            "status": "building",
            "buildtime": 1457359890796
        },
        {
          "id": "scx-back-duplicate-detection",
          "status": "passed",
          "buildtime": 1457359890796
        }
    ];

const weatherIcons = ['mdi-weather-sunny', 'mdi-weather-cloudy', 'mdi-weather-pouring', 'mdi-weather-lightning', 'mdi-weather-partlycloudy'];

const styles = {
  container: {
    textAlign: 'left',
    padding: 20,
    color: '#fff'
  },
  cardSuccess: {
    color: '#fff',
    background: Colors.greenA700,
    marginBottom: '1rem'
  },
  cardFailure: {
    color: '#fff',
    background: Colors.redA700,
    marginBottom: '1rem'
  },
  cardTitle: {
    color: '#fff',
    fontSize: '1.2em'
  },
  cardSubTitle: {
    color: '#fff',
    fontSize: '1em',
    fontWeight: 100
  },
  progress: {
    color: '#fff',
    float: 'right'
  },
  fab: {
    position: 'fixed',
    right: 50,
    bottom: 50
  }
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

  randomWeatherIcon() {
    let idx = Math.floor(Math.random() * weatherIcons.length);
    return weatherIcons[idx]; 
  }

  generateDOM() {
    return pipelines.map((pipeline, idx) => {
      let progressBtn = pipeline.status === 'building' ?  <CircularProgress className="progress" color="#fff" size={0.5} /> : null;
      return (
        <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
          <Card style={pipeline.status === 'failed' ? styles.cardFailure : styles.cardSuccess}>
            <CardHeader
              title={pipeline.id}
              titleStyle={styles.cardTitle}
              subtitle={pipeline.status}
              subtitleStyle={styles.cardSubTitle}>
              <i className={this.randomWeatherIcon() + ' mdi mdi-48px buildstatus'}></i>
            </CardHeader>
            <CardText>
              <div className="buildinfo">
                <div>
                  <p>
                    <i className="mdi mdi-clock mdi-24px"></i>
                    <span>{ Moment(pipeline.buildtime).fromNow() }</span>
                  </p>
                  <p>
                    <i className="mdi mdi-worker mdi-24px"></i>
                    <span>Mats R</span>
                  </p>
                </div>
                <div>
                  {progressBtn}
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
            {this.generateDOM()}
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
