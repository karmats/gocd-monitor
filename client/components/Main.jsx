/**
 * In this file, we create a React component
 * which incorporates components providedby material-ui.
 */

import React from 'react';

import { Dialog, FlatButton, FloatingActionButton } from 'material-ui/lib';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import { Card, CardHeader, CardText } from 'material-ui/lib/card';
import Colors from 'material-ui/lib/styles/colors';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';

import Moment from 'moment';

import Pipeline from './Pipeline';

const pipelines = [
        {
            "id": "scx-back-4.1",
            "status": "passed",
            "buildtime": 1457085089646,
            "author": "Mats R"
        },
        {
            "id": "scx-gui-4.1",
            "status": "passed",
            "buildtime": 1457359890796,
            "author": "Mats R"
        },
        {
            "id": "scx-back-5.0",
            "status": "failed",
            "buildtime": 1318781876406,
            "author": "Per A"
        },
        {
            "id": "scx-gui-5.0",
            "status": "building",
            "buildtime": 1457359890796,
            "author": "Mats R"
        },
        {
          "id": "scx-back-duplicate-detection",
          "status": "passed",
          "buildtime": 1457359890796,
           "author": "Hongchao L"
        }
    ];

const styles = {
  container: {
    textAlign: 'left',
    padding: 20,
    color: '#fff'
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
      open: false,
      adminMode: window.location.search.indexOf('mode=admin') >= 0
    };
  }

  generatePipelines() {
    return pipelines.map((pipeline, idx) => {
      return (
        <div key={pipeline.id} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
          <Pipeline pipeline={pipeline} />
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
    let fab = this.state.adminMode ? (
      <FloatingActionButton style={styles.fab}
        primary={true}
        onTouchTap={this.handleTouchTap}>
        <ContentAdd />
      </FloatingActionButton>
    ) : null;

    let standardActions = (
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
            {this.generatePipelines()}
          </div>
          <Dialog
            open={this.state.open}
            title="Super Secret Password"
            actions={standardActions}
            onRequestClose={this.handleRequestClose}>
            1-2-3-4-5
          </Dialog>
          {fab}
        </div>
      </MuiThemeProvider>
    );
  }
}
