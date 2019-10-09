import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { grey, purple } from '@material-ui/core/colors';
import { subscribeToSettingsUpdates, reconnect } from './api';
import Main from './components/Main';
import TestResults from './components/TestResults';

// Application theme
let enableDarkTheme = false;
// If dark theme setting is changed, a remount is needed
subscribeToSettingsUpdates((settings) => {
  if (settings.darkTheme !== enableDarkTheme) {
    enableDarkTheme = settings.darkTheme;
    renderApp(enableDarkTheme);
    // Need to reconnect socket.io since we're rerendering the whole app
    reconnect();
  }
});

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

const createTheme = (darkTheme) => createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    type: darkTheme ? 'dark' : 'light',
    primary: purple
  }
});


// Render react router routes
const renderApp = (darkTheme) => {
  // Need to wrap it in a timeout since there's a race condition that takes place when settings are updated with dark theme
  setTimeout(() => {
    const appNode = document.getElementById('app');
    // Unmount if this is a remount
    if (appNode.children.length) {
      ReactDOM.unmountComponentAtNode(appNode);
    }
    // Theme specific
    const theme = createTheme(darkTheme);
    document.body.style.background = darkTheme ? grey[800] : grey[100];
    ReactDOM.render((
      <MuiThemeProvider theme={theme}>
        <Router>
          <Switch>
            <Route path="/test-results" render={() => (
              <TestResults darkTheme={darkTheme} />
            )} />
            <Route path="/" render={(props) => (
              <Main darkTheme={darkTheme} {...props} />
            )} />
          </Switch>
        </Router>
      </MuiThemeProvider>
    ), appNode)
  }, 0)
}
renderApp(enableDarkTheme);
