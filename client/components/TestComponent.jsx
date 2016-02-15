import React from 'react';
import RaisedButton from 'material-ui/lib/raised-button';

export default class TestComponent extends React.Component {

  render() {
    return (
      <div>
        <h1>Hello dashboard</h1>
        <RaisedButton label="Default" />
        <RaisedButton label="Primary" primary={true} />
      </div>
    );
  }
}
