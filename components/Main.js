import React from 'react';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import themeDecorator from 'material-ui/lib/styles/theme-decorator';
import colors from 'material-ui/lib/styles/colors';

import TestComponent from './TestComponent';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: colors.green500,
    primary2Color: colors.green700,
    primary3Color: colors.green100,
  },
}, {
  avatar: {
    borderColor: null,
  },
  userAgent: 'all',
});

class Main extends React.Component {
  render() {
    return (
      <div>
        <div>Hello world</div>
        <TestComponent />
      </div>
    );
  }
}

export default themeDecorator(muiTheme)(Main)