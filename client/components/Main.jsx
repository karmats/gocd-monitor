/**
 * Main jsx-file
 */

import React from 'react';

import { Dialog, FlatButton, FloatingActionButton, Snackbar } from 'material-ui';
import Settings from 'material-ui/svg-icons/action/settings';
import * as Colors from 'material-ui/styles/colors';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';

import moment from 'moment';

import Pipeline from './Pipeline';
import Configuration from './Configuration';


const muiTheme = getMuiTheme({
  palette: {
    primary1Color: Colors.purple700,
  }
});

const styles = {
  fab: {
    position: 'fixed',
    right: 50,
    bottom: 50
  }
};

// Sort by latest build time or pipeline status. Status is sorted by building, cancelled, failed, passed and paused
const sortOrders = [{
  name : 'buildtime',
  label: 'Build time'
},
{
  name: 'status',
  label: 'Status (building, failed, cancelled, passed, paused)'
}];


export default class Main extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.socket = props.socket;

    // Setup initial state
    this.state = {
      // All active pipelines
      pipelines: [],
      // Names of all pipelines
      pipelineNames: [],
      // Pipelines that are disabled
      disabledPipelines: [],
      // Pipeline name to group name map
      pipelineNameToGroupName: {},
      // Current sort order
      sortOrder: sortOrders[0],
      // If settings dialog open or not
      settingsDialogOpened: false,
      // Snackbar message
      showMessage: false,
      filterRegexProps: {
        active: false,
        value: ''
      },
      message: ''
    };
  }

  componentDidMount() {
    // Listen for connection errors
    this.socket.on('connect_error', (err) => {
      this.setState({
          showMessage: true,
          message: "Connect Error: " + err.message
      });
    });

    // Listen for updates
    this.socket.on('pipelines:updated', (newPipelines) => {
      let disabledPipelines = this.state.disabledPipelines.slice();
      let sortOrderName = this.state.sortOrder.name;
      this.setState({
        pipelines: this.sortPipelines(newPipelines, disabledPipelines, sortOrderName)
      })
    });

    // Names of all pipelines
    this.socket.on('pipelines:names', (pipelineNames) => {
      this.setState({
        pipelineNames: pipelineNames
      })
    });

    // Pipeline name to group name map
    this.socket.on('pipelineNameToGroupName:updated', (pipelineNameToGroupName) => {
      this.setState({
        pipelineNameToGroupName: pipelineNameToGroupName
      })
    });

    // Settings from server
    this.socket.on('settings:updated', (settings) => {
      let pipelines = this.state.pipelines.slice();
      if (settings.disabledPipelines && settings.sortOrder) {
        this.setState({
          pipelines: this.sortPipelines(pipelines, settings.disabledPipelines, settings.sortOrder),
          sortOrder : sortOrders.filter(s => settings.sortOrder === s.name)[0],
          disabledPipelines: settings.disabledPipelines,
          filterRegexProps: settings.filterRegexProps || { active : false, value : '' }
        });
      }
    });

    // Request latest pipelines
    this.socket.emit('pipelines:get');
  }

  /**
   * Update disabled pipelines based upon regex requirement
   * @param {Object} configurationProperties to update
   */
  updateDisabledPipelines(settings) {
    const regexFilter = new RegExp(settings.filterRegexProps.value);
    settings.disabledPipelines = this.state.pipelineNames.filter((p) => {
      if (regexFilter.test(p)){
        return !settings.filterRegexProps.active;
      }
      return settings.filterRegexProps.active;
    });
  }

  saveSettings(settings) {
    this.socket.emit('settings:update', {
      sortOrder: settings.sortOrder.name,
      disabledPipelines: settings.disabledPipelines,
      filterRegexProps: settings.filterRegexProps
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
      sortOrder: this.state.sortOrder,
      filterRegexProps: this.state.filterRegexProps
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

  updateFilterRegexProps(filterRegexProps) {
    this.configurationProperties.filterRegexProps = filterRegexProps;
    this.updateDisabledPipelines(this.configurationProperties);
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
    // Add "time ago" moment string
    activePipelines.forEach((pipeline) => {
      pipeline.timeago = moment(pipeline.buildtime).fromNow();
    });
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

        let statusIndex = {
          building: -1,
          failed: 0,
          cancelled: 1,
          passed: 2,
          paused: 3,
          unknown: 3,
        }
        
        if (statusIndex[aStatus]  < statusIndex[bStatus] ){
          return -1;
        }
        else
          return 1;
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
        onClick={this.openSettings.bind(this)}>
        <Settings />
      </FloatingActionButton>
    ) : null;

    const settingsActions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={this.closeSettings.bind(this)}
      />,
      <FlatButton
        label="Save"
        primary={true}
        onClick={this.saveSettings.bind(this, this.configurationProperties)}
      />
    ];

    var pipelineElements;

    if (Object.keys(this.state.pipelineNameToGroupName).length < 1) {
      let pipelineCards = this.state.pipelines.map((pipeline) => {
        if (pipeline) {
          return (
            <div key={pipeline.name} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
              <Pipeline pipeline={pipeline} />
            </div>
          )
        }
      });
      pipelineElements = (
        <div className="row">
          {pipelineCards}
        </div>
      )
    } else {
      let groupNameToPipelines = new Object();
      this.state.pipelines.map((pipeline) => {
        if (pipeline) {
          let groupName = this.state.pipelineNameToGroupName[pipeline.name];
          if (groupNameToPipelines[groupName] == undefined) {
            groupNameToPipelines[groupName] = [pipeline]
          } else {
            groupNameToPipelines[groupName].push(pipeline);
          }
        }
      });

      pipelineElements = Object.keys(groupNameToPipelines).map((groupName) => {
        let pipelineCards = groupNameToPipelines[groupName].map((pipeline) => {
          if (pipeline) {
            return (
              <div key={pipeline.name} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
                <Pipeline pipeline={pipeline} />
              </div>
            )
          }
        });
        return (
          <div>
            <div className="groupName">
              {groupName}
            </div>
            <div className="row">
              {pipelineCards}
            </div>
          </div>
        )
      });
    }

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className="appcontainer">
          {pipelineElements}
          <Dialog
            open={this.state.settingsDialogOpened}
            title="Configuration"
            actions={settingsActions}
            autoScrollBodyContent={true}
            onRequestClose={this.closeSettings.bind(this)}>
            <Configuration pipelines={this.state.pipelineNames} sortOrder={this.state.sortOrder} disabledPipelines={this.state.disabledPipelines} filterRegexProps={this.state.filterRegexProps} sortOrders={sortOrders} onSortOrderChange={this.changeSortOrder.bind(this)} onTogglePipeline={this.togglePipeline.bind(this)} onFilterRegexPropsChange={this.updateFilterRegexProps.bind(this)} />
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
