/**
 * Test results jsx-file
 */

import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Snackbar from '@material-ui/core/Snackbar';
import AddIcon from '@material-ui/icons/Add';
import purple from '@material-ui/core/colors/purple';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import moment from 'moment';

import TestReport from './TestReport';
import AddTest from './AddTest';


const theme = createMuiTheme({
  palette: {
    primary: purple
  }
});

const styles = {
  addTestBtn: {
    position: 'fixed',
    right: 50,
    bottom: 50
  }
};

// From latest report to this number of days back in time
const daysInterval = 20;

export default class TestResults extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.socket = props.socket;

    // Setup initial state
    this.state = {
      // Results
      testReports: [],
      pipelines: [],
      addTestDialogOpened: false,
      // Snackbar message
      msg: ''
    };
  }

  componentDidMount() {
    // All pipeline names
    this.socket.on('pipelines:names', (pipelines) => {
      this.setState({
        pipelines: pipelines
      });
    });

    // Updated test results
    this.socket.on('tests:updated', (testReports) => {
      this.setState({
        testReports: testReports.map(this.convertReport).sort(this.sortReports)
      });
    });

    this.socket.on('tests:message', (message) => {
      this.setState({
        msg: message
      });
    });

    // Request latest test results
    this.socket.emit('tests:get');
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
   * Sort reports. Failed first, then time for latest report
   */
  sortReports(r1, r2) {
    const latest1 = r1.history[r1.history.length - 1];
    const latest2 = r2.history[r2.history.length - 1];
    if (latest2.failed > 0 && latest1.failed <= 0) {
      return 1;
    }
    if (latest1.failed > 0 && latest2.failed <= 0) {
      return -1;
    }
    if (latest2.when > latest1.when) {
      return 1;
    }
    return -1;
  }

  /**
   * Converts report data to report object
   */
  convertReport(report) {
    // Report model
    const reportView = {
      id: report._id,
      title: `${report.pipeline} (${report.stage})`,
      subtitle: report.job
    };
    if (report.cucumber) {
      // Create chart history data      
      reportView.history = report.cucumber
        // Sort by time ascending
        .sort((a, b) => {
          return a.timestamp > b.timestamp ? 1 : -1;
        })
        // Filter reports that are not in defined interval
        .filter((report, idx, arr) => {
          // Latest test case = last in list
          const latestTestTime = moment(arr[arr.length - 1].timestamp);
          const currTestTime = moment(report.timestamp);
          return latestTestTime.diff(currTestTime, 'days') <= daysInterval;
        })
        .reduce((acc, c) => {
          const errors = [];
          let passed = 0;
          let failed = 0;
          c.features.forEach((feature) => {
            feature.scenarios.forEach((scenario) => {
              scenario.steps.forEach((step) => {
                if (step.result === 'passed') {
                  passed++;
                } else {
                  failed++;
                  errors.push({
                    test: scenario.name,
                    message: step.error,
                  });
                }
              })
            })
          })
          acc.push({
            passed: passed,
            failed: failed,
            errors: errors,
            when: c.timestamp
          });
          return acc;
        }, []);

    }
    return reportView;
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
    this.socket.emit('tests:add', this.selectedPipeline);
    this.closeAddTest();
  }

  /**
   * Removes a test
   * 
   * @param {Object} report The report to remove
   */
  removeTest(report) {
    this.socket.emit('tests:remove', report.id);
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
      <Button
        variant="fab"
        color="primary"
        style={styles.addTestBtn}
        onClick={this.openAddTest.bind(this) }>
        <AddIcon />
      </Button>
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

    const reports = this.state.testReports.map((report) => {
      return (
        <div key={report.title} className="col-md-4 col-sm-6 col-xs-12">
          <TestReport report={report} admin={adminMode} onRemoveTest={this.removeTest.bind(this)} />
        </div>)
    });

    return (
      <MuiThemeProvider theme={theme}>
        <div className="appcontainer">
          <div className="row">
            {reports}
          </div>
          <Dialog
            open={this.state.addTestDialogOpened}
            onClose={this.closeAddTest.bind(this) }>
            <DialogTitle>
              Add Test
            </DialogTitle>
            <DialogContent>
              Select a pipeline to generate test reports for. For now only cucumber json is supported.
              <AddTest pipelines={this.state.pipelines} onPipelineSelect={this.selectTestPipeline.bind(this) } />
            </DialogContent>
            <DialogActions>
              {addTestActions}
            </DialogActions>
          </Dialog>
          <Snackbar
            open={this.state.msg.length > 0}
            message={this.state.msg}
            autoHideDuration={5000}
            onRequestClose={this.resetMessage.bind(this)} />
          {addBtn}
        </div>
      </MuiThemeProvider>
    );
  }
}
