/**
 * Test results jsx-file
 */

import React from 'react';

import io from 'socket.io-client';

import { Dialog, FlatButton, FloatingActionButton } from 'material-ui';
import Add from 'material-ui/svg-icons/content/add';
import { purple700 } from 'material-ui/styles/colors';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';

import TestReport from './TestReport';
import AddTest from './AddTest';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: purple700,
  }
});

const styles = {
  fab: {
    position: 'fixed',
    right: 50,
    bottom: 50
  }
};

const socket = io();

export default class TestResults extends React.Component {

  constructor(props, context) {
    super(props, context);

    // Setup initial state
    this.state = {
      // Results
      testReports: {},
      pipelines: [],
      addTestDialogOpened: false,
    };
  }

  componentDidMount() {
    // All pipelines
    socket.on('pipelines:names', (pipelines) => {
      if (pipelines.length > 0) {
        this.setState({
          pipelines: pipelines
        });
      }
    });

    // Updated test results
    socket.on('tests:updated', (testReports) => {
      console.log(testReports);
      this.setState({
        testReports : testReports
      });
    });

    // Request latest test results
    socket.emit('tests:get');
  }

  closeAddTest() {
    this.setState({
      addTestDialogOpened: false
    });
    // Reset the test to add
    this.selectedPipeline = null;
  }

  openAddTest() {
    this.setState({
      addTestDialogOpened: true
    });
  }

  /**
   * Add test reports for a pipeline
   */
  addTest() {
    socket.emit('tests:add', this.selectedPipeline);
    this.closeAddTest();
  }

  /**
   * Select a pipeline to generate tests for
   */
  selectTestPipeline(pipelineTest) {
    this.selectedPipeline = pipelineTest;
  }

  render() {
    // In adminMode tests can be added
    const adminMode = window.location.search.indexOf('admin') >= 0;

    const addBtn = adminMode ? (
      <FloatingActionButton
        style={styles.fab}
        primary={true}
        onTouchTap={this.openAddTest.bind(this)}>
        <Add />
      </FloatingActionButton>
    ) : null;

    const addTestActions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onTouchTap={this.closeAddTest.bind(this)}
      />,
      <FlatButton
        label="Add"
        primary={true}
        onTouchTap={this.addTest.bind(this)}
      />
    ];
    
    let testReports = [0, 1, 2, 3, 4].map((no) => {
      return (
      <div key={no} className="col-lg-4 col-md-6 col-sm-6 col-xs-12">
        <TestReport report={'Test-' + no} />
      </div>)
    });

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className="appcontainer">
          <div className="row">
            {testReports}
          </div>
          <Dialog
            title="Add Test"
            open={this.state.addTestDialogOpened}
            actions={addTestActions}
            onRequestClose={this.closeAddTest.bind(this)}>
            Select a pipeline to generate test reports for. For now only cucumber json is supported.
            <AddTest pipelines={this.state.pipelines} onPipelineSelect={this.selectTestPipeline.bind(this)} />
          </Dialog>
          {addBtn}
        </div>
      </MuiThemeProvider>
    );
  }
}
