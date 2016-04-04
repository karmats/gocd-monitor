/**
 * Configuration dialog
 */

import React from 'react';

import {List, ListItem, Toggle} from 'material-ui/lib';

export default class Configuration extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.pipelines = this.props.pipelines.map(p => { return {name : p.name, active: p.active} }).sort((a,b) => a.name > b.name ? 1 : -1);
  }

  togglePipeline(p, event) {
    this.props.onTogglePipeline(p, event.target.checked);
  }

  render() {
    let pipelines = 
    (
      <List subheader="Filter Pipelines">
        { this.pipelines.map((p) => {
            return <ListItem key={p.name} primaryText={p.name} rightToggle={<Toggle defaultToggled={p.active} onToggle={this.togglePipeline.bind(this, p.name)} />} />
        }) }
      </List>
    );
    return (
      <div>
        {pipelines}
      </div>
    );
  }
}
