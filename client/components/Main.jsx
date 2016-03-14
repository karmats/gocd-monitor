/**
 * Main jsx-file
 */

import React from 'react';

import io from 'socket.io-client';

import { Dialog, FlatButton, FloatingActionButton } from 'material-ui/lib';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import { Card, CardHeader, CardText } from 'material-ui/lib/card';
import Colors from 'material-ui/lib/styles/colors';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';

import Pipeline from './Pipeline';

// Setup socket.io
const socket = io();


// FIXME: Break out to style.css
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

    socket.on('pipelines:update', (newPipelines) => {
      let sortedPipelines = newPipelines.filter(p => p && p.name).sort((a, b) => {
        return a.results[0].buildtime > b.results[0].buildtime ? -1 : 1;
      });
      this.setState({
        pipelines : sortedPipelines
      })
    });
    // Setup initial state
    this.state = {
      open: false,
      // In adminMode new pipelines can be added
      adminMode: window.location.search.indexOf('mode=admin') >= 0,
      // All pipelines
      pipelines: []
    };
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

    let pipelineCards = this.state.pipelines.map((pipeline) => {
      if (pipeline && pipeline.name) {
        return (
          <div key={pipeline.name} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
            <Pipeline pipeline={pipeline} />
          </div>
        )
      }
    });

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={styles.container}>
          <div className="row">
            {pipelineCards}
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
