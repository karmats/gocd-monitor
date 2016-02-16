/**
 * In this file, we create a React component
 * which incorporates components providedby material-ui.
 */

import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import Colors from 'material-ui/lib/styles/colors';
import FlatButton from 'material-ui/lib/flat-button';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import TestComponent from './TestComponent';

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: 200
  },
  fab: {
    position: 'absolute',
    right: 50,
    bottom: 50
  }
};

const muiTheme = getMuiTheme({

});

export default class Main extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.handleTouchTap = this.handleTouchTap.bind(this);

    this.state = {
      open: false,
    };
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  handleTouchTap() {
    this.setState({
      open: true,
    });
  }

  render() {
    const standardActions = (
      <FlatButton
        label="Okey"
        secondary={true}
        onTouchTap={this.handleRequestClose}
      />
    );

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={styles.container}>
          <TestComponent />
          <Dialog
            open={this.state.open}
            title="Super Secret Password"
            actions={standardActions}
            onRequestClose={this.handleRequestClose}>
            1-2-3-4-5
          </Dialog>
          <FloatingActionButton style={styles.fab}
            primary={true}
            onTouchTap={this.handleTouchTap}>
           <ContentAdd />
         </FloatingActionButton>
        </div>
      </MuiThemeProvider>
    );
  }
}
