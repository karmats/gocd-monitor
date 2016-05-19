import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from './components/Main';
import TestResults from './components/TestResults';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

// Render the main app react component into the app div.
// For more details see: https://facebook.github.io/react/docs/top-level-api.html#react.render
// Not a very elegant solution, but to avoid the need of implementing the react router, this works ok 
if (document.getElementById('tests')) {
  ReactDOM.render(<TestResults />, document.getElementById('tests'));
} else {
  ReactDOM.render(<Main />, document.getElementById('app'));
}
