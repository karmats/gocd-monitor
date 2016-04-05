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

// Sort by latest build time or pipeline status. Status is sorted by building, failed, passed and paused
const sortOrders = [{
  name : 'buildtime',
  label: 'Build time'
}, 
{
  name: 'status',
  label: 'Status (building, failed, passed, paused)'
}];

export default class Main extends React.Component {

  constructor(props, context) {
    super(props, context);

    // Setup initial state
    this.state = {
      // All pipelines
      pipelines: [],
      // Sort order
      sortOrder: sortOrders[0],
      // If settings dialog open or not
      open: false
    };
  }

  componentDidMount() {
    const socket = io();
    // Setup socket.io and listen for updates
    socket.on('pipelines:update', (newPipelines) => {
      this.setState({
        pipelines: this.sortPipelines(newPipelines, this.state.sortOrder.name)
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
   * @param {string}  pipelineName  Name of the pipeline to toggle
   * @param {boolean} active        Weather to show or hide it
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
   * Change current pipeline sort order
   * 
   * @param {Object}  newSortOrder  The sort order to change to, @see const sortOrders
   */
  changeSortOrder(newSortOrder) {
    this.setState({
      sortOrder: newSortOrder,
      pipelines: this.sortPipelines(this.state.pipelines, newSortOrder.name)
    });
  }

  /**
   * Sort pipelines by date and filter out pipelines without data
   * 
   * @param   {Array} pipelines The pipelines to sort
   * @return  {Array} Sorted pipelines
   */
  sortPipelines(pipelines, sortOrder) {
    const activePipelines = pipelines.filter(p => p && p.active);
    const sortByBuildTime = (a, b) => {
      return a.buildtime > b.buildtime ? -1 : 1;
    };
    if (sortOrder === 'buildtime') {
      return activePipelines.sort(sortByBuildTime);
    } else {
      const building = activePipelines.filter(p => p.status === 'building').sort(sortByBuildTime);
      const failed = activePipelines.filter(p => p.status === 'failed').sort(sortByBuildTime);
      const passed = activePipelines.filter(p => p.status === 'passed').sort(sortByBuildTime);
      const paused = activePipelines.filter(p => p.status === 'paused').sort(sortByBuildTime);
      return building.concat(failed, passed, paused);
    }
  }

  render() {
    // In adminMode settings can be configured
    const adminMode = window.location.search.indexOf('admin') >= 0;

    const settingsBtn = adminMode ? (
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
      return (
        <div key={pipeline.name} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
          <Pipeline pipeline={pipeline} />
        </div>
      )
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
            <Configuration pipelines={this.state.pipelines} sortOrder={this.state.sortOrder} sortOrders={sortOrders} onSortOrderChange={this.changeSortOrder.bind(this)} onTogglePipeline={this.togglePipeline.bind(this)} />
          </Dialog>
          {settingsBtn}
        </div>
      </MuiThemeProvider>
    );
  }
}
