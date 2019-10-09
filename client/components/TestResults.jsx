/**
 * Test results jsx-file
 */

import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Fab from '@material-ui/core/Fab';
import Snackbar from '@material-ui/core/Snackbar';
import AddIcon from '@material-ui/icons/Add';

import {
  subscribeToPipelineNames,
  subscribeToTestResultUpdates,
  subscribeToTestMessage,
  unsubscribeToPipelineNames,
  unsubscribeToTestResultUpdates,
  unsubscribeToTestMessage,
  emitTestResults,
  emitTestResultAdd,
  emitTestResultRemove
} from "../api";

import { sortReports, convertReport } from './TestResults.util';
import TestReport from './TestReport';
import AddTest from './AddTest';

const createStyles = darkTheme => ({
  addTestBtn: {
    position: 'fixed',
    right: 50,
    bottom: 50,
    color: darkTheme ? '#000' : '#fff'
  }
});

export default class TestResults extends React.Component {

  constructor(props, context) {
    super(props, context);

    // Setup initial state
    this.state = {
      // Results
      testReports: [],
      pipelines: [],
      selectedPipeline: '',
      addTestDialogOpened: false,
      // Snackbar message
      msg: '',
    };
  }

  // Listeners
  pipelineNamesListener = (pipelines) => {
    this.setState({
      pipelines: pipelines
    });
  }
  testResultsListener = (testReports) => {
    this.setState({
      testReports: testReports.map(convertReport).sort(sortReports)
    });
  }
  testMessageListener = (message) => {
    this.setState({
      msg: message
    });
  }

  // React lifecycle functions
  componentDidMount() {
    subscribeToPipelineNames(this.pipelineNamesListener);
    subscribeToTestResultUpdates(this.testResultsListener);
    subscribeToTestMessage(this.testMessageListener);

    // Request latest test results
    emitTestResults();
  }

  componentWillUnmount() {
    unsubscribeToPipelineNames(this.pipelineNamesListener);
    unsubscribeToTestResultUpdates(this.testResultsListener);
    unsubscribeToTestMessage(this.testMessageListener);
  }

  // Handlers
  closeAddTest() {
    this.setState({
      addTestDialogOpened: false,
      selectedPipeline: ''
    });
  }

  openAddTest() {
    this.setState({
      addTestDialogOpened: true
    });
  }

  resetMessage() {
    this.setState({
      msg: ''
    });
  }

  /**
   * Add test reports for a pipeline
   */
  addTest() {
    emitTestResultAdd(this.state.selectedPipeline);
    this.closeAddTest();
  }

  /**
   * Removes a test
   * 
   * @param {Object} report The report to remove
   */
  removeTest(report) {
    emitTestResultRemove(report.id);
  }

  /**
   * Select a pipeline to generate tests for
   */
  handleSelectTestPipeline(e) {
    this.setState({selectedPipeline: e.target.value});
  }

  render() {
    const styles = createStyles(this.props.darkTheme);
    const { testReports, pipelines, selectedPipeline, addTestDialogOpened, msg } = this.state;
    // In adminMode tests can be added
    const adminMode = window.location.search.indexOf('admin') >= 0

    const addBtn = adminMode ? (
      <Fab
        color="primary"
        style={styles.addTestBtn}
        onClick={this.openAddTest.bind(this)}>
        <AddIcon />
      </Fab>
    ) : null;

    const addTestActions = [
      <Button
        key="cancel-test"
        onClick={this.closeAddTest.bind(this) }
        >
        Cancel
      </Button>,
      <Button
        key="add-test"
        color="primary"
        onClick={this.addTest.bind(this) }
        >
        Add
      </Button>
    ];

    const reports = testReports.map((report) => {
      return (
        <div key={report.title} className="col-md-4 col-sm-6 col-xs-12">
          <TestReport report={report} admin={adminMode} onRemoveTest={this.removeTest.bind(this)} />
        </div>)
    });

    return (
      <div className="appcontainer">
        <div className="row">
          {reports}
        </div>
        <Dialog
          open={addTestDialogOpened}
          onClose={this.closeAddTest.bind(this) }>
          <DialogTitle>
            Add Test
          </DialogTitle>
          <DialogContent>
            Select a pipeline to generate test reports for. For now only cucumber json is supported.
            <AddTest pipelines={pipelines.sort()} selectedPipeline={selectedPipeline} onPipelineSelect={this.handleSelectTestPipeline.bind(this) } />
          </DialogContent>
          <DialogActions>
            {addTestActions}
          </DialogActions>
        </Dialog>
        <Snackbar
          open={msg.length > 0}
          message={this.state.msg}
          autoHideDuration={5000}
          onClose={this.resetMessage.bind(this)} />
        {addBtn}
      </div>
    );
  }
}
