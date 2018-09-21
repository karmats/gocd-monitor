import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import io from 'socket.io-client';

import { switchBetweenPagesInterval } from '../app-config';
import Main from './components/Main';
import TestResults from './components/TestResults';
import purple from '@material-ui/core/colors/purple';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

// Setup a socket to pass to components that uses it
const socket = io();

// When no route is found
class NoRoute extends React.Component {
  render() {
    return <h1>No route found :(</h1>
  }
}

// Switch between pipeline and test results page, don't when in admin mode
const adminMode = window.location.search.indexOf('admin') >= 0;
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
const theme = createMuiTheme({
  palette: {
    primary: purple
  }
});
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
