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

import {
  subscribeToErrors,
  subscribeToPipelineUpdates,
  subscribeToPipelineNames,
  subscribeToPipelineNameToGroupUpdates,
  subscribeToSettingsUpdates,
  emitSettingsUpdate,
  emitPipelineNames,
  unsubscribeToPipelineUpdates,
  unsubscribeToSettingsUpdates,
  unsubscribeToPipelineNameToGroupUpdates,
  unsubscribeToPipelineNames,
  unsubscribeToErrors
} from "../api";

import Pipeline from './Pipeline';

import ConfigurationDialog from "./ConfigurationDialog";

const createStyles = darkTheme => ({
  fab: {
    position: 'fixed',
    right: 50,
    bottom: 50,
    color: darkTheme ? '#000' : '#fff'
  }
});

const groupPath = '/group/';
const groupRegex = new RegExp(`${groupPath}(.+)$`);
/**
* Sort pipelines by date and filter out pipelines without data
*
* @param   {Array}   pipelines         The pipelines to sort
* @param   {Array}   disabledPipelines Pipelines that are disabled
* @param   {string}  sortOrder         The sort order, 'buildtime' or 'status'
* @param   {string}  filterRegex       Regular expression to filter for
* @return  {Array}   Sorted pipelines
*/
export const sortAndFilterPipelines = (pipelines, disabledPipelines, sortOrder, filterRegex) => {
 const pipelineIsValid = p => p && p.name
 const pipelineIsNotDisabled =  p => disabledPipelines.indexOf(p.name) < 0
 const pipelineMatchesRegex = p => p.name.match(filterRegex)

  const activePipelines = pipelines.filter(pipelineIsValid)
   .filter(pipelineIsNotDisabled)
   .filter(pipelineMatchesRegex);

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
      filterRegex: '',
      message: ''
    };
  }

  // Listeners
  pipelinesListener = (newPipelines) => {
    const { disabledPipelines, sortOrder, filterRegex } = this.state;
    this.setState({
      pipelines: sortAndFilterPipelines(newPipelines, disabledPipelines, sortOrder, filterRegex)
    })
  }

  settingsListener = (settings) => {
    const { pipelines } = this.state;
    if (settings.disabledPipelines && settings.sortOrder) {
      this.setState({
        pipelines: sortAndFilterPipelines(pipelines, settings.disabledPipelines, settings.sortOrder, settings.filterRegex),
        sortOrder : settings.sortOrder,
        disabledPipelines: settings.disabledPipelines,
        filterRegex: settings.filterRegex || ''
      });
    }
  }

  pipelineNameToGroupListener = (pipelineNameToGroupName) => {
    this.setState({
      pipelineNameToGroupName
    })
  }

  pipelineNamesListener = (pipelineNames) => {
    this.setState({
      pipelineNames
    })
  }

  errorsListener = (err) => {
    this.setState({
        showMessage: true,
        message: "Connect Error: " + err.message
    });
  }

  // React lifecycle functions
  componentDidMount() {
    subscribeToErrors(this.errorsListener);
    subscribeToPipelineUpdates(this.pipelinesListener);
    subscribeToPipelineNames(this.pipelineNamesListener);
    subscribeToPipelineNameToGroupUpdates(this.pipelineNameToGroupListener);
    subscribeToSettingsUpdates(this.settingsListener);
    // Request latest pipelines
    emitPipelineNames();
  }

  componentWillUnmount() {
    unsubscribeToErrors(this.errorsListener);
    unsubscribeToPipelineUpdates(this.pipelinesListener);
    unsubscribeToPipelineNames(this.pipelineNamesListener);
    unsubscribeToPipelineNameToGroupUpdates(this.pipelineNameToGroupListener);
    unsubscribeToSettingsUpdates(this.settingsListener);
  }

  // Handlers
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
    this.setState({
      settingsDialogOpened: false,
      showMessage: true,
      message: 'Settings saved. If you activated pipelines hold your breath for a minute, they will show up :)'
    }, () => {
      emitSettingsUpdate(newSettings);
    });
  }

  closeSnackbar() {
    this.setState({
      showMessage : false,
      message: ''
    });
  }

  render() {
    const styles = createStyles(this.props.darkTheme);
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
              <Pipeline pipeline={pipeline} darkTheme={this.props.darkTheme} />
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
                <Pipeline pipeline={pipeline} darkTheme={this.props.darkTheme} />
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
                                                    filterRegex={this.state.filterRegex}
                                                    pipelineNames={this.state.pipelineNames}
                                                    sortOrder={this.state.sortOrder}
                                                    darkTheme={this.props.darkTheme}
                                                    />
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
