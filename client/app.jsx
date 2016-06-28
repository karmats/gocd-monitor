import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin';

import io from 'socket.io-client';

import { switchBetweenPagesInterval } from '../app-config';
import Main from './components/Main';
import TestResults from './components/TestResults';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

// Setup a socket to pass to components that uses it
const socket = io();

// Dummy component to use for Route root
class App extends React.Component {
  render() {
    return <div>{this.props.children}</div>
  }
}

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
  }, switchBetweenPagesInterval*1000)
}

// Render react router routes
ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Main} socket={socket}></IndexRoute>
      <Route path="test-results" component={TestResults} socket={socket}/>
      <Route path="*" component={NoRoute}/>
    </Route>
  </Router>
), document.getElementById('app'))
