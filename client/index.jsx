import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { grey, purple } from '@material-ui/core/colors';
import { subscribeToSettingsUpdates } from './api';
import Main from './components/Main';
import TestResults from './components/TestResults';

// Application theme
let enableDarkTheme = false;
// If dark theme setting is changed, a remount is needed
subscribeToSettingsUpdates((settings) => {
  if (settings.darkTheme !== enableDarkTheme) {
    enableDarkTheme = settings.darkTheme;
    renderApp();
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
const renderApp = () => {
  const appNode = document.getElementById('app');
  // Unmount if this is a remount
  if (appNode.children.length) {
    ReactDOM.unmountComponentAtNode(appNode);
  }
  // Theme specific
  const theme = createTheme(enableDarkTheme);
  document.body.style.background = enableDarkTheme ? grey[800] : grey[100];
  ReactDOM.render((
    <MuiThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route path="/test-results" render={() => (
            <TestResults />
          )} />
          <Route path="/" render={(props) => (
            <Main darkTheme={enableDarkTheme} {...props} />
          )} />
        </Switch>
      </Router>
    </MuiThemeProvider>
  ), appNode)
}
renderApp();
