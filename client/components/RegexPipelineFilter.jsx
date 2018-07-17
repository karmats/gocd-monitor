import React from 'react';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import Switch from '@material-ui/core/Switch';

export default class RegexPipelineFilter extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      filterRegexActive: props.filterRegexProps.active,
      filterRegex: props.filterRegexProps.value
    }
  }

  updateFilterRegexProps() {
    this.props.onFilterRegexPropsChange({
      active: this.state.filterRegexActive,
      value: this.state.filterRegex
    })
  }

  updateFilterRegex(e) {
    this.setState({
      filterRegex: e.target.value
    });
  }

  updateFilterRegexActive(e) {
    this.setState({
      filterRegexActive: e.target.checked
    });
  }

  render() {
    let filterByRegex = (
      <ListItem
        primaryText={
          <input
            type="text"
            value={this.state.filterRegex}
            onChange={this.updateFilterRegex.bind(this)}
          />
        }
        rightToggle={
          <Switch checked={this.state.filterRegexActive} onChange={this.updateFilterRegexActive.bind(this)}/>
        }/>
    );

    return (
      <List>
        <ListSubheader>Filter Pipelines</ListSubheader>
        {filterByRegex}
        <ListItem
          rightIconButton={<Button
              label="Update Regex"
              color="primary"
              onClick={this.updateFilterRegexProps.bind(this)}
            />}
        />
        <Divider />
      </List>
    );
  }
}