/**
 * ConfigurationDialog dialog
 */

import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Switch from '@material-ui/core/Switch';
import {ListItemText, Radio} from '../../node_modules/@material-ui/core';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import DialogActions from "@material-ui/core/DialogActions";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";

const styles = {
  formControl: { width: "100%", marginTop: "16px" }
}

export default class ConfigurationDialog extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      disabledPipelines: this.props.disabledPipelines,
      filterRegex: this.props.filterRegex,
      pipelineNames: this.props.pipelineNames,
      sortOrder: this.props.sortOrder,
      darkTheme: this.props.darkTheme
    };
  }

  isRegexValid() {
    try {
      new RegExp(this.state.filterRegex);
      return true
    } catch (_) {
      return false
    }
  }

  isPipelineSelectionDisabled(pipelineName) {
    return !this.isRegexValid() || !pipelineName.match(this.state.filterRegex)
  }

  isPipelineToggledOn(pipelineName) {
    return !this.isPipelineSelectionDisabled(pipelineName) && this.state.disabledPipelines.indexOf(pipelineName) === -1
  }

  sortOrderChanged(e) {
    this.setState({
      sortOrder: e.target.value
    })
  }

  regexChanged(e) {
    this.setState({
      filterRegex: e.target.value
    })
  }

  darkThemeChanged(e) {
    this.setState({
      darkTheme: e.target.checked
    })
  }

  togglePipeline(event) {
    let pipelineName = event.target.value;
    let pipelineEnabled = event.target.checked;
    let newDisabledPipelines = [...this.state.disabledPipelines]
    if (pipelineEnabled) {
      newDisabledPipelines.splice(newDisabledPipelines.indexOf(pipelineName), 1)
    } else {
      newDisabledPipelines.push(pipelineName)
    }
    this.setState({
      disabledPipelines: newDisabledPipelines
    })
  }

  onCancel() {
    this.props.onCancel()
  }

  onSave() {
    this.props.onSave({
      disabledPipelines: this.state.disabledPipelines,
      sortOrder: this.state.sortOrder,
      filterRegex: this.state.filterRegex,
      darkTheme: this.state.darkTheme
    })
  }

  render() {
    return (<Dialog
      open={true}>
      <DialogTitle>
        Configuration
      </DialogTitle>

      <DialogContent>
        <FormControl>
          <FormLabel>Sort Order</FormLabel>
          <RadioGroup
            value={this.state.sortOrder}
            onChange={this.sortOrderChanged.bind(this)}
            aria-label="sort-order"
            name="sort-order">
            <FormControlLabel value="buildtime" control={<Radio color="primary"/>} label="Build time"/>
            <FormControlLabel value="status" control={<Radio color="primary"/>}
                              label="Status (building, failed, cancelled, passed, paused)"/>

          </RadioGroup>
        </FormControl>
        <FormControl style={styles.formControl}>
          <FormLabel>Dark Theme</FormLabel>
          <Switch checked={this.state.darkTheme} value="darkTheme" color="primary" onChange={this.darkThemeChanged.bind(this)}/>
        </FormControl>
        <FormControl style={styles.formControl} error={!this.isRegexValid()}>
          <FormLabel>Filter Pipelines</FormLabel>
          <List component="ul" disablePadding>
            <ListSubheader disableGutters>
              <Input

                placeholder="some regular expression"
                value={this.state.filterRegex}
                onChange={this.regexChanged.bind(this)}
                fullWidth={true}
              />
            </ListSubheader>
            {this.state.pipelineNames.map(p => (
              <ListItem key={p} dense disabled={this.isPipelineSelectionDisabled(p)} disableGutters>
                <ListItemText primary={p}/>
                <ListItemSecondaryAction>
                  <Switch checked={this.isPipelineToggledOn(p)} color="primary" value={p}
                          disabled={this.isPipelineSelectionDisabled(p)} onChange={this.togglePipeline.bind(this)}/>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </FormControl>

      </DialogContent>
      <DialogActions>
        <Button onClick={this.onCancel.bind(this)}>Cancel</Button>
        <Button onClick={this.onSave.bind(this)}>Save</Button>
      </DialogActions>
    </Dialog>)
  }
}
