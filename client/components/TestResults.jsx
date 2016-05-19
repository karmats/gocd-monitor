/**
 * Test results jsx-file
 */

import React from 'react';

import * as Colors from 'material-ui/styles/colors';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';


const muiTheme = getMuiTheme({
  palette: {
    primary1Color: Colors.purple700,
  }
});


export default class TestResults extends React.Component {

  constructor(props, context) {
    super(props, context);

    // Setup initial state
    this.state = {
      // Results
      testResults: []
    };
  }

  render() {

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className="appcontainer">
          <h3>Hello world</h3>
        </div>
      </MuiThemeProvider>
    );
  }
}
