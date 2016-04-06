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

const socket = io();

export default class Main extends React.Component {

  constructor(props, context) {
    super(props, context);

    // Setup initial state
    this.state = {
      // All pipelines
      pipelines: [],
      // Configurable settings
      settings: {
        disabledPipelines: [],
        sortOrder: sortOrders[0]
      },
      // If settings dialog open or not
      settingsDialogOpened: false
    };
  }

  componentDidMount() {
    // Listen for updates
    socket.on('pipelines:updated', (newPipelines) => {
      this.setState({
        pipelines: this.sortPipelines(newPipelines, this.state.settings.disabledPipelines, this.state.settings.sortOrder.name)
      })
    });

    // Settings from server
    socket.on('settings:updated', (settings) => {
      if (settings.disabledPipelines && settings.sortOrder) {
        this.setState({
          pipelines: this.sortPipelines(this.state.pipelines, settings.disabledPipelines, settings.sortOrder),
          settings: {
            sortOrder : sortOrders.filter(s => settings.sortOrder === s.name)[0] || sortOrders[0],
            disabledPipelines: settings.disabledPipelines
          }
        });
      }
    });
  }

  saveSettings(settings) {
    socket.emit('settings:update', {
      sortOrder: settings.sortOrder.name,
      disabledPipelines: settings.disabledPipelines
    });
    this.closeSettings();
  }

  closeSettings() {
    this.setState({
      settingsDialogOpened: false
    });
  }

  openSettings() {	
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
    let disabledPipelines = this.state.settings.disabledPipelines.slice();
    if (active) {
      disabledPipelines = disabledPipelines.filter(pName => pName !== pipelineName);
    } else {
      disabledPipelines.push(pipelineName);
    }
    this.setState((prevState) => {
      return {
        settings : {
          sortOrder: prevState.settings.sortOrder,
          disabledPipelines : disabledPipelines
        }
      }
    });
  }

  /**
   * Change current pipeline sort order
   * 
   * @param {Object}  newSortOrder  The sort order to change to, @see const sortOrders
   */
  changeSortOrder(newSortOrder) {
    this.setState((prevState) => {
      return {
        settings : {
          sortOrder: newSortOrder,
          disabledPipelines : prevState.settings.disabledPipelines
        }
      }
    });
  }

  /**
   * Sort pipelines by date and filter out pipelines without data
   * 
   * @param   {Array} pipelines The pipelines to sort
   * @return  {Array} Sorted pipelines
   */
  sortPipelines(pipelines, disabledPipelines, sortOrder) {
    const activePipelines = pipelines.filter(p => p && disabledPipelines.indexOf(p.name) < 0);
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

    const settingsActions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onTouchTap={this.closeSettings.bind(this)}
      />,
      <FlatButton
        label="Save"
        primary={true}
        onTouchTap={this.saveSettings.bind(this, this.state.settings)}
      />
    ];

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
            open={this.state.settingsDialogOpened}
            title="Configuration"
            actions={settingsActions}
            autoScrollBodyContent={true}
            onRequestClose={this.closeSettings.bind(this)}>
            <Configuration pipelines={this.state.pipelines} settings={this.state.settings} sortOrders={sortOrders} onSortOrderChange={this.changeSortOrder.bind(this)} onTogglePipeline={this.togglePipeline.bind(this)} />
          </Dialog>
          {settingsBtn}
        </div>
      </MuiThemeProvider>
    );
  }
}
