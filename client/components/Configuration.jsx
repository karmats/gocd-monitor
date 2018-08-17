/**
 * Configuration dialog
 */

import React from 'react';

import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Switch from '@material-ui/core/Switch';

import RegexPipelineFilter from './RegexPipelineFilter';
import { Radio, ListItemText } from '../../node_modules/@material-ui/core';

export default class Configuration extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      // Sort filterable pipelines names
      pipelines: this.setupPipelines(props.pipelines, props.disabledPipelines),
      // Configurable sort order
      currentSortOrder: props.sortOrder,
      filterRegexProps: props.filterRegexProps
    };
  }

  componentDidMount() {
    const { pipelines, disabledPipelines } = this.props;
    this.setState({
      pipelines: this.setupPipelines(pipelines, disabledPipelines)
    });
  }


  // Setup and sort pipelines by name
  setupPipelines(pipelines, disabledPipelines) {
    return pipelines
      .map((p) => {
        return {name: p, active: disabledPipelines.indexOf(p) < 0}
      })
      .sort((a, b) => a.name > b.name ? 1 : -1);
  }

  // Toggles a pipeline on/off
  togglePipeline(event) {
    this.props.onTogglePipeline(event.target.value, event.target.checked);
  }

  // Sort order changed
  sortOrderChanged(event) {
    const { sortOrders, onSortOrderChange } = this.props;
    const newSortOrder = sortOrders.filter(s => s.name === event.target.value).pop();
    this.setState({
      currentSortOrder: newSortOrder
    });
    onSortOrderChange(newSortOrder);
  }

  updateFilterRegexProps() {
    const { filterRegexActive, filterRegex } = this.state;
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
    this.setState({
      filterRegexActive: e.target.checked
    });
  }

  render() {
    const { sortOrders, onFilterRegexPropsChange } = this.props;
    const { currentSortOrder, pipelines, filterRegexProps } = this.state;
    return (
      <div>
        <List>
          <ListSubheader>Sort Order</ListSubheader>
            {
            sortOrders.map((s) => 
                (
                  <ListItem key={s.name} dense button>
                    <Radio
                      color="primary"
                      checked={currentSortOrder === s}
                      value={s.name}
                      onChange={this.sortOrderChanged.bind(this)}
                    />
                    <ListItemText primary={s.label} />
                  </ListItem>
                )
            )
          }
          <Divider />
        </List>
        <RegexPipelineFilter filterRegexProps={filterRegexProps} onFilterRegexPropsChange={onFilterRegexPropsChange}/>
        <List>
          <ListSubheader>Toggle Pipelines</ListSubheader>

          {pipelines.map((p) => (
              <ListItem key={p.name} button dense>
                <ListItemText primary={p.name} />
                <ListItemSecondaryAction>
                  <Switch defaultChecked={p.active} color="primary" value={p.name} onChange={this.togglePipeline.bind(this)} />
                </ListItemSecondaryAction>
              </ListItem>
            )
          )}
        </List>
      </div>
    );
  }
}
