import React from 'react';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Input from '@material-ui/core/Input';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
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
    const { filterRegex, filterRegexActive } = this.state;
    const { onFilterRegexPropsChange } = this.props;
    onFilterRegexPropsChange({
      active: filterRegexActive,
      value: filterRegex
    })
  }

  updateFilterRegex(e) {
    this.setState({
      filterRegex: e.target.value
    });
  }

  updateFilterRegexActive(e) {
    const active = e.target.checked;
    const regex = active ? this.state.filterRegex : '';
    this.setState({
      filterRegexActive: active,
      filterRegex: regex
    });
  }

  render() {
    const { filterRegexActive, filterRegex } = this.state;

    return (
      <List>
        <ListSubheader>Filter Pipelines</ListSubheader>
        <ListItem>
          <ListItemText primary={
            <Input
              type="text"
              disabled={!filterRegexActive}
              value={filterRegex}
              onChange={this.updateFilterRegex.bind(this)}
            />
          }
          />
          <ListItemSecondaryAction>
            <Switch color="primary" checked={filterRegexActive} onChange={this.updateFilterRegexActive.bind(this)}/>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemSecondaryAction>
            <Button
                color="primary"
                onClick={this.updateFilterRegexProps.bind(this)}
            >
              Update Regex
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
        <Divider />
      </List>
    );
  }
}