/**
 * Main jsx-file
 */

import React from 'react';
import {Link} from 'react-router-dom'

import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Snackbar from '@material-ui/core/Snackbar';
import Settings from '@material-ui/icons/Settings';

import moment from 'moment';

import Pipeline from './Pipeline';

import ConfigurationDialog from "./ConfigurationDialog";

const styles = {
  fab: {
    position: 'fixed',
    right: 50,
    bottom: 50
  }
};

const groupPath = '/group/';
const groupRegex = new RegExp(`${groupPath}(.+)$`);
/**
* Sort pipelines by date and filter out pipelines without data
*
* @param   {Array}   pipelines         The pipelines to sort
* @param   {Array}   disabledPipelines Pipelines that are disabled
* @param   {string}  sortOrder         The sort order, 'buildtime' or 'status'
* @return  {Array}   Sorted pipelines
*/
export const sortPipelines = (pipelines, disabledPipelines, sortOrder) => {
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
     const aStatus = Pipeline.status(a);
     const bStatus = Pipeline.status(b);

     if (aStatus === bStatus) {
       return sortByBuildTime(a, b);
     }

     const statusIndex = {
       building: -1,
       failed: 0,
       cancelled: 1,
       passed: 2,
       paused: 3,
       unknown: 3,
     }
     return statusIndex[aStatus] - statusIndex[bStatus] ;
   });
 }
}

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
      sortOrder: 'buildtime',
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
      this.setState({
        pipelines: sortPipelines(newPipelines, disabledPipelines, this.state.sortOrder)
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
          pipelines: sortPipelines(pipelines, settings.disabledPipelines, settings.sortOrder),
          sortOrder : settings.sortOrder,
          disabledPipelines: settings.disabledPipelines,
          filterRegexProps: settings.filterRegexProps || { active : false, value : '' }
        });
      }
    });

    // Request latest pipelines
    this.socket.emit('pipelines:get');
  }

  openSettings() {
    this.setState({
      settingsDialogOpened: true
    });
  }

  cancelSettings() {
    this.setState({
      settingsDialogOpened: false
    });
  }

  saveSettings(newSettings) {
    this.socket.emit('settings:update', {
      sortOrder: newSettings.sortOrder,
      disabledPipelines: newSettings.disabledPipelines,
      filterRegexProps: {active: true, value: newSettings.filterRegex}
    });

    this.setState({
      settingsDialogOpened: false,
      showMessage: true,
      message: 'Settings saved. If you activated pipelines hold your breath for a minute, they will show up :)'
    });
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
      <Fab
        color="primary"
        style={styles.fab}
        onClick={this.openSettings.bind(this)}>
        <Settings />
      </Fab>
    ) : null;

    let pipelineElements;
    const groupMatch = groupRegex.exec(this.props.location.pathname);
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
        if (groupMatch && groupMatch[1] != groupName) {
          return null;
        }
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
              <Link to={`${groupPath}${groupName}${window.location.search}`}>{groupName}</Link>
            </div>
            <div className="row">
              {pipelineCards}
            </div>
          </div>
        )
      });
    }

    let backButton = null;
    if (groupMatch) {
      backButton = (<Button
        variant="contained"
        color="primary"
        onClick={() => this.props.history.push(`/${window.location.search}`)}>
          Back to all groups
      </Button>);
    }

    let newConfigurationDialog = null
    if (this.state.settingsDialogOpened) {
      newConfigurationDialog = <ConfigurationDialog onCancel={this.cancelSettings.bind(this)}
                                                    onSave={this.saveSettings.bind(this)}
                                                    disabledPipelines={this.state.disabledPipelines}
                                                    filterRegex={this.state.filterRegexProps.value}
                                                    pipelineNames={this.state.pipelineNames}
                                                    sortOrder={this.state.sortOrder}/>
    }

    return (
      <div className="appcontainer">
        {pipelineElements}
        {backButton}
        {newConfigurationDialog}
        <Snackbar
          open={this.state.showMessage}
          message={this.state.message}
          autoHideDuration={5000}
          onClose={this.closeSnackbar.bind(this)}
        />
        {settingsBtn}
      </div>
    );
  }
}
