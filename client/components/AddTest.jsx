/**
 * Add test dialog
 */

import React from 'react';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

export default ({ pipelines, selectedPipeline, onPipelineSelect }) => (
  <div>
      <FormControl style={{minWidth: 240, marginTop: 20}}>
        <InputLabel htmlFor="select-pipeline">Select pipeline</InputLabel>
        <Select
          value={selectedPipeline}
          onChange={onPipelineSelect.bind(this)}
          inputProps={{id : 'select-pipeline'}}>
          {pipelines.map(p => (
              p ? <MenuItem key={p} value={p}>{p}</MenuItem> : null
            )
          )}
        </Select>
      </FormControl>
    </div>
)
