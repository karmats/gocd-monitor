/**
 * Configuration dialog
 */

import React from 'react';

import {Divider, DropDownMenu, List, ListItem, MenuItem, Popover, SelectField, Toggle} from 'material-ui/lib';

export default class Configuration extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      // Sort filterable pipelines by name
      pipelines: this.setupPipelines(props.pipelines, props.settings.disabledPipelines),
      // Configurable sort order
      currentSortOrder: props.settings.sortOrder,
      // List of sort order options openened or not
      sortOrderListOpened: false
    }
  }

  componentDidMount() {
    this.setState({
      pipelines: this.setupPipelines(this.props.pipelines, this.props.settings.disabledPipelines || [])
    });
  }

  setupPipelines(pipelines, disabledPipelines) {
    const sortedPipelines = this.props.pipelines
    .reduce((p, c) => {
      // Disabled pipelines are added later
      if (c && c.name && disabledPipelines.indexOf(c.name) < 0) {
        p.push({ name : c.name, active: true })
      }
      return p;
    }, [])
    .concat(disabledPipelines.map(dp => {
      return { name : dp, active: false } })
    );
    return sortedPipelines.sort((a,b) => a.name > b.name ? 1 : -1);
  }

  // Toggles a pipeline on/off
  togglePipeline(p, event) {
    this.props.onTogglePipeline(p.name, event.target.checked);
  }
  
  // Sort order changed
  sortOrderChanged(sortOrder) {
    this.setState({
      currentSortOrder: sortOrder,
      sortOrderListOpened: false
    });
    this.props.onSortOrderChange(sortOrder);
  }

  openSortOrderList(e) {
    this.setState({
      sortOrderListOpened: true,
      anchorEl: e.target
    });
  }

  closeSortOrderList() {
    this.setState({
      sortOrderListOpened: false
    });
  }

  render() {
    
    let sortOrders = 
      (<List>
        {
          this.props.sortOrders.map((s) => {
            return <ListItem key={s.name} primaryText={s.label} onTouchTap={this.sortOrderChanged.bind(this, s)}  />
        }
      ) }
      </List>
    );

    let pipelines = 
    (
      <List subheader="Filter Pipelines">
        { this.state.pipelines.map((p) => {
            return <ListItem key={p.name} primaryText={p.name} rightToggle={<Toggle defaultToggled={p.active} onToggle={this.togglePipeline.bind(this, p)} />} />
        }) }
        <Popover
          open={this.state.sortOrderListOpened}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'center'}}
          targetOrigin={{horizontal: 'left', vertical: 'center'}}
          onRequestClose={this.closeSortOrderList.bind(this)}
          useLayerForClickAway={true}
        >
          {sortOrders}
        </Popover>
      </List>
    );

    return (
      <div>
        <List subheader="General">
          <ListItem primaryText="Sort Order" secondaryText={this.state.currentSortOrder.label} onTouchTap={this.openSortOrderList.bind(this)} />
        <Divider />
        </List>
        {pipelines}
      </div>
    );
  }
}
