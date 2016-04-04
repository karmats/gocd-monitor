/**
 * Main jsx-file
 */

import React from 'react';

import io from 'socket.io-client';

import { Dialog, FlatButton, FloatingActionButton } from 'material-ui/lib';
import Settings from 'material-ui/lib/svg-icons/action/settings';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import Colors from 'material-ui/lib/styles/colors';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';

import Pipeline from './Pipeline';
import Configuration from './Configuration';


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

    // Setup initial state
    this.state = {
      // All pipelines
      pipelines: [],
      // If settings dialog open or not
      open: false,
      // In adminMode settings can be configured
      adminMode: window.location.search.indexOf('admin') >= 0,
    };
  }

  componentDidMount() {
    const socket = io();
    // Setup socket.io and listen for updates
    socket.on('pipelines:update', (newPipelines) => {
      this.setState({
        pipelines: this.sortPipelines(newPipelines)
      })
    });
  }

  closeSettings(e) {
    if (e) {
      // Save settings
      console.log('Saving settings..');
    }
    this.setState({
      open: false
    });
  }

  openSettings() {	
    this.setState({
      open: true
    });
  }

  /**
   * Show/hide a pipeline. Used in configuration dialog
   * 
   * @param pipelineName  Name of the pipeline to toggle
   * @param active        Weather to show or hide it
   */
  togglePipeline(pipelineName, active) {
    this.setState({
      pipelines: this.state.pipelines.map((p) => {
        if (p.name === pipelineName) {
          p.active = active;
        }
        return p;
      })
    })
  }

  /**
   * Sort pipelines by date and filter out pipelines without data
   * 
   * @param   {Array} pipelines The pipelines to sort
   * @return  {Array} Sorted pipelines
   */
  sortPipelines(pipelines) {
    return pipelines.filter(p => p && p.name).sort((a, b) => {
      return a.buildtime > b.buildtime ? -1 : 1;
    });
  }

  render() {

    const settingsBtn = this.state.adminMode ? (
      <FloatingActionButton style={styles.fab}
        primary={true}
        onTouchTap={this.openSettings.bind(this)}>
        <Settings />
      </FloatingActionButton>
    ) : null;

    const settingsActions = (
      <FlatButton
        label="Okey"
        primary={true}
        onTouchTap={this.closeSettings.bind(this)}
      />
    );

    let pipelineCards = this.state.pipelines.map((pipeline) => {
      if (pipeline && pipeline.active) {
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
            title="Configuration"
            actions={settingsActions}
            autoScrollBodyContent={true}
            onRequestClose={this.closeSettings.bind(this)}>
            <Configuration pipelines={this.state.pipelines} onTogglePipeline={this.togglePipeline.bind(this)} />
          </Dialog>
          {settingsBtn}
        </div>
      </MuiThemeProvider>
    );
  }
}
