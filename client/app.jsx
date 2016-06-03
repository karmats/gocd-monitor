import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from './components/Main';
import TestResults from './components/TestResults';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

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

// Render react router routes
ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Main}></IndexRoute>
      <Route path="test-results" component={TestResults}/>
      <Route path="*" component={NoRoute}/>
    </Route>
  </Router>
), document.getElementById('app'))
