/**
 * Add test dialog
 */

import React from 'react';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

export default class AddTest extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      pipelines: [],
      testToAdd: ''
    }
  }

  componentDidMount() {
    this.setState({
      pipelines: this.props.pipelines.sort()
    });
  }
  
  handleChange(event) {
    const pipeline = event.target.value;
    this.setState({
      testToAdd: pipeline
    });
    this.props.onPipelineSelect(pipeline);
  }

  render() {
    return (
      <div>
        <FormControl style={{minWidth: 240, marginTop: 20}}>
          <InputLabel htmlFor="select-pipeline">Select pipeline</InputLabel>
          <Select
            value={this.state.testToAdd}
            onChange={this.handleChange.bind(this)}
            inputProps={{id : 'select-pipeline'}}>
            { this.state.pipelines.map(p => {
                return p ? <MenuItem key={p} value={p}>{p}</MenuItem> : null
            }) }
          </Select>
        </FormControl>
      </div>
    );
  }
}
