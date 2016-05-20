/**
 * Add test dialog
 */

import React from 'react';

import { SelectField, MenuItem } from 'material-ui';

export default class Configuration extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      pipelines: [],
      testToAdd: null
    }
  }

  componentDidMount() {
    this.setState({
      // Sort pipelines by name
      pipelines: this.props.pipelines.sort((a,b) => (a && b && a.name > b.name) ? 1 : -1)
    });
  }
  
  handleChange(event, index, value) {
    this.setState({
      testToAdd: value
    });
    this.props.onPipelineSelect(value);
  }

  render() {

    let pipelines = 
    (
      <SelectField
        autoWidth={true}
        value={this.state.testToAdd}
        onChange={this.handleChange.bind(this)}
        floatingLabelText="Select pipeline">
        { this.state.pipelines.map((p, idx) => {
            return p ? <MenuItem key={idx} primaryText={p.name} value={p} /> : null
        }) }
      </SelectField>
    );

    return (
      <div>
        {pipelines}
      </div>
    );
  }
}
