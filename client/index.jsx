import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import io from 'socket.io-client';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { grey, purple } from '@material-ui/core/colors';
import Main from './components/Main';
import TestResults from './components/TestResults';

// Setup a socket to pass to components that uses it;
// use the host only, to support group URLs and pass on query parameters for configuration
const socket = io(window.location.protocol + '//' + window.location.host + window.location.search);

// Switch between pipeline and test results page, don't when in admin mode
const adminMode = window.location.search.indexOf('admin') >= 0;
const switchBetweenPagesInterval = process.env.SWITCH_BETWEEN_PAGES_INTERVAL;
if (switchBetweenPagesInterval && switchBetweenPagesInterval > 0 && !adminMode) {
  setTimeout(() => {
    if (window.location.pathname.indexOf('test-results') >= 0) {
      window.location.replace('/');
    } else {
      window.location.replace('/test-results');
    }
  }, switchBetweenPagesInterval * 1000)
}

// Application theme
const enableDarkTheme = process.env.ENABLE_DARK_THEME;
const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    type: enableDarkTheme ? 'dark' : 'light',
    primary: purple
  }
});

if (enableDarkTheme) {
    document.body.style.background = grey[800];
}

// Render react router routes
ReactDOM.render((
  <MuiThemeProvider theme={theme}>
    <Router>
      <Switch>
        <Route path="/test-results" render={() => (
          <TestResults socket={socket} />
        )} />
        <Route path="/" render={(props) => (
          <Main socket={socket} {...props} />
        )} />
      </Switch>
    </Router>
  </MuiThemeProvider>
), document.getElementById('app'))
