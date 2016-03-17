/**
 * Main jsx-file
 */

import React from 'react';

import io from 'socket.io-client';

import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import Colors from 'material-ui/lib/styles/colors';
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
      // All pipelines
      pipelines: []
    };
  }

  render() {

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
        </div>
      </MuiThemeProvider>
    );
  }
}
