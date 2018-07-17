/**
 * Add test dialog
 */

import React from 'react';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

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
      pipelines: this.props.pipelines.sort()
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
      <Select
        autoWidth={true}
        value={this.state.testToAdd}
        onChange={this.handleChange.bind(this)}
        floatingLabelText="Select pipeline">
        { this.state.pipelines.map((p, idx) => {
            return p ? <MenuItem key={idx} primaryText={p} value={p} /> : null
        }) }
      </Select>
    );

    return (
      <div>
        {pipelines}
      </div>
    );
  }
}
