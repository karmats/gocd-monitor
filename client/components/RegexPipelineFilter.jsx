import React from 'react';
import {Divider, List, ListItem, Subheader, Toggle, FlatButton} from 'material-ui';

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
          <Toggle defaultToggled={this.state.filterRegexActive} onToggle={this.updateFilterRegexActive.bind(this)}/>
        }/>
    );

    return (
      <List>
        <Subheader>Filter Pipelines</Subheader>
        {filterByRegex}
        <ListItem
          rightIconButton={<FlatButton
              label="Update Regex"
              primary={true}
              onTouchTap={this.updateFilterRegexProps.bind(this)}
            />}
        />
        <Divider />
      </List>
    );
  }
}