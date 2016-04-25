/**
 * Main jsx-file
 */

import React from 'react';

import io from 'socket.io-client';

import { Dialog, FlatButton, FloatingActionButton, Snackbar } from 'material-ui/lib';
import Settings from 'material-ui/lib/svg-icons/action/settings';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import Colors from 'material-ui/lib/styles/colors';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';

import Pipeline from './Pipeline';
import Configuration from './Configuration';


const muiTheme = getMuiTheme({
  palette: {
    accent1Color: Colors.purple700
  }
});

const styles = {
  fab: {
    position: 'fixed',
    right: 50,
    bottom: 50
  }
};

// Sort by latest build time or pipeline status. Status is sorted by building, failed, passed and paused
const sortOrders = [{
  name : 'buildtime',
  label: 'Build time'
}, 
{
  name: 'status',
  label: 'Status (building, failed, passed, paused)'
}];

const socket = io();

export default class Main extends React.Component {

  constructor(props, context) {
    super(props, context);

    // Setup initial state
    this.state = {
      // All active pipelines
      pipelines: [],
      // Names of all pipelines
      pipelineNames: [],
      // Pipelines that are disabled
      disabledPipelines: [],
      // Current sort order
      sortOrder: sortOrders[0],
      // If settings dialog open or not
      settingsDialogOpened: false,
      // Snackbar message
      showMessage: false,
      message: ''
    };
  }

  componentDidMount() {
    // Listen for updates
    socket.on('pipelines:updated', (newPipelines) => {
      let disabledPipelines = this.state.disabledPipelines.slice();
      let sortOrderName = this.state.sortOrder.name;
      this.setState({
        pipelines: this.sortPipelines(newPipelines, disabledPipelines, sortOrderName)
      })
    });

    // Names of all pipelines
    socket.on('pipelines:names', (pipelineNames) => {
      this.setState({
        pipelineNames: pipelineNames
      })
    });

    // Settings from server
    socket.on('settings:updated', (settings) => {
      let pipelines = this.state.pipelines.slice();
      if (settings.disabledPipelines && settings.sortOrder) {
        this.setState({
          pipelines: this.sortPipelines(pipelines, settings.disabledPipelines, settings.sortOrder),
          sortOrder : sortOrders.filter(s => settings.sortOrder === s.name)[0],
          disabledPipelines: settings.disabledPipelines
        });
      }
    });
  }

  saveSettings(settings) {
    socket.emit('settings:update', {
      sortOrder: settings.sortOrder.name,
      disabledPipelines: settings.disabledPipelines
    });
    this.setState({
      settingsDialogOpened: false,
      showMessage: true,
      message: 'Settings saved. If you activated pipelines hold your breath for a minute, they will show up :)'
    });
    this.closeSettings();
  }

  closeSettings() {
    this.setState({
      settingsDialogOpened: false
    });
    // Reset configuration properties
    this.configurationProperties = {}
  }

  openSettings() {
    // Init the configuration properties
    this.configurationProperties = {
      disabledPipelines: this.state.disabledPipelines,
      sortOrder: this.state.sortOrder
    }	
    this.setState({
      settingsDialogOpened: true
    });
  }

  /**
   * Show/hide a pipeline. Used in configuration dialog
   * 
   * @param {string}  pipelineName  Name of the pipeline to toggle
   * @param {boolean} active        Weather to show or hide it
   */
  togglePipeline(pipelineName, active) {
    let disabledPipelines = this.configurationProperties.disabledPipelines;
    if (active) {
      disabledPipelines = disabledPipelines.filter(pName => pName !== pipelineName);
    } else {
      disabledPipelines.push(pipelineName);
    }
    this.configurationProperties.disabledPipelines = disabledPipelines;
  }

  /**
   * Change current pipeline sort order
   * 
   * @param {Object}  newSortOrder  The sort order to change to, @see const sortOrders
   */
  changeSortOrder(newSortOrder) {
    this.configurationProperties.sortOrder = newSortOrder;
  }

  /**
   * Sort pipelines by date and filter out pipelines without data
   * 
   * @param   {Array}   pipelines         The pipelines to sort
   * @param   {Array}   disabledPipelines Pipelines that are disabled
   * @param   {string}  sortOrder         The sort order, 'buildtime' or 'status'
   * @return  {Array}   Sorted pipelines  
   */
  sortPipelines(pipelines, disabledPipelines, sortOrder) {
    const activePipelines = pipelines.filter(p => p && p.name && disabledPipelines.indexOf(p.name) < 0);
    const sortByBuildTime = (a, b) => {
      return a.buildtime > b.buildtime ? -1 : 1;
    };

    if (sortOrder === 'buildtime') {
      return activePipelines.sort(sortByBuildTime);
    } else {
      return activePipelines.sort((a, b) => {
        let aStatus = Pipeline.status(a);
        let bStatus = Pipeline.status(b);

        if (aStatus === bStatus) {
          return sortByBuildTime(a, b);
        }
        switch(aStatus) {
          case 'building':
            return -1;
          case 'failed':
            return bStatus === 'building' ? 1 : -1;
          case 'passed':
            return bStatus === 'building' || bStatus === 'failed' ? 1 : -1;
          default:
            return bStatus !== 'paused' ? 1 : -1;
        }
      });
    }
  }

  closeSnackbar() {
    this.setState({
      showMessage : false,
      message: ''
    });
  }

  render() {
    // In adminMode settings can be configured
    const adminMode = window.location.search.indexOf('admin') >= 0;

    const settingsBtn = adminMode ? (
      <FloatingActionButton
        style={styles.fab}
        primary={true}
        onTouchTap={this.openSettings.bind(this)}>
        <Settings />
      </FloatingActionButton>
    ) : null;

    const settingsActions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onTouchTap={this.closeSettings.bind(this)}
      />,
      <FlatButton
        label="Save"
        primary={true}
        onTouchTap={this.saveSettings.bind(this, this.configurationProperties)}
      />
    ];

    let pipelineCards = this.state.pipelines.map((pipeline) => {
      if (pipeline) {
        return (
          <div key={pipeline.name} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
            <Pipeline pipeline={pipeline} />
          </div>
        )
      }
    });

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className="appcontainer">
          <div className="row">
            {pipelineCards}
          </div>
          <Dialog
            open={this.state.settingsDialogOpened}
            title="Configuration"
            actions={settingsActions}
            autoScrollBodyContent={true}
            onRequestClose={this.closeSettings.bind(this)}>
            <Configuration pipelines={this.state.pipelineNames} sortOrder={this.state.sortOrder} disabledPipelines={this.state.disabledPipelines} sortOrders={sortOrders} onSortOrderChange={this.changeSortOrder.bind(this)} onTogglePipeline={this.togglePipeline.bind(this)} />
          </Dialog>
          <Snackbar
            open={this.state.showMessage}
            message={this.state.message}
            autoHideDuration={5000}
            onRequestClose={this.closeSnackbar.bind(this)}
          />
          {settingsBtn}
        </div>
      </MuiThemeProvider>
    );
  }
}
