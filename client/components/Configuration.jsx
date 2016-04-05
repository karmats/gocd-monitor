/**
 * Configuration dialog
 */

import React from 'react';

import {Divider, DropDownMenu, List, ListItem, MenuItem, Popover, SelectField, Toggle} from 'material-ui/lib';

export default class Configuration extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      pipelines: this.props.pipelines.map(p => { return {name : p.name, active: p.active} }).sort((a,b) => a.name > b.name ? 1 : -1),
      currentSortOrder: this.props.sortOrder,
      sortOrderListOpened: false
    }
  }

  togglePipeline(p, event) {
    this.props.onTogglePipeline(p, event.target.checked);
  }
  
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
            return <ListItem key={s.name} primaryText={s.label} onTouchTap={this.sortOrderChanged.bind(this, s)} />
        }
      ) }
      </List>
    );

    let pipelines = 
    (
      <List subheader="Filter Pipelines">
        { this.state.pipelines.map((p) => {
            return <ListItem key={p.name} primaryText={p.name} rightToggle={<Toggle defaultToggled={p.active} onToggle={this.togglePipeline.bind(this, p.name)} />} />
        }) }
        <Popover
          open={this.state.sortOrderListOpened}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'center'}}
          targetOrigin={{horizontal: 'left', vertical: 'center'}}
          onRequestClose={this.closeSortOrderList.bind(this)}
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
