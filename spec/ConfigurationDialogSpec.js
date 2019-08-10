import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';

import Pipeline from '../client/components/Pipeline';
import ConfigurationDialog from "../client/components/ConfigurationDialog";

describe('ConfigurationDialog spec', () => {

  describe('Pipeline Selection', () => {
    describe('#isPipelineToggledOn()', function () {
      it('should display disabled pipelines as toggled off, the rest as toggled on', () => {
        const dialog = new ConfigurationDialog({
          disabledPipelines: new Set(['pipeline-3']),
          filterRegex: '',
          pipelineNames: ['pipeline-1','pipeline-2','pipeline-3','pipeline-4'],
          sortOrder: 'buildtime'
        });

        expect(dialog.isPipelineToggledOn('pipeline-1')).to.be.true;
        expect(dialog.isPipelineToggledOn('pipeline-2')).to.be.true;
        expect(dialog.isPipelineToggledOn('pipeline-3')).to.be.false;
        expect(dialog.isPipelineToggledOn('pipeline-4')).to.be.true;
      })

      it('should display pipelines as toggled off when they dont match the regex', () => {
        const dialog = new ConfigurationDialog({
          disabledPipelines: new Set([]),
          filterRegex: 'pipeline-[1-2]',
          pipelineNames: ['pipeline-1','pipeline-2','pipeline-3','pipeline-4'],
          sortOrder: 'buildtime'
        });
        expect(dialog.isPipelineToggledOn('pipeline-1')).to.be.true;
        expect(dialog.isPipelineToggledOn('pipeline-2')).to.be.true;
        expect(dialog.isPipelineToggledOn('pipeline-3')).to.be.false;
        expect(dialog.isPipelineToggledOn('pipeline-4')).to.be.false;
      })
    });

    describe('#isPipelineSelectionDisabled()', function () {
      it('should not allow pipelines to be toggled when they dont match the regex', () => {
        const dialog = new ConfigurationDialog({
          disabledPipelines: new Set([]),
          filterRegex: 'pipeline-[1-2]',
          pipelineNames: ['pipeline-1','pipeline-2','pipeline-3','pipeline-4'],
          sortOrder: 'buildtime'
        });
        expect(dialog.isPipelineSelectionDisabled('pipeline-1')).to.be.false;
        expect(dialog.isPipelineSelectionDisabled('pipeline-2')).to.be.false;
        expect(dialog.isPipelineSelectionDisabled('pipeline-3')).to.be.true;
        expect(dialog.isPipelineSelectionDisabled('pipeline-4')).to.be.true;
      })
      it('should not allow any pipeline to be toggled when the regex is invalid', () => {
        const dialog = new ConfigurationDialog({
          disabledPipelines: new Set([]),
          filterRegex: 'pipeline-[',
          pipelineNames: ['pipeline-1','pipeline-2','pipeline-3','pipeline-4'],
          sortOrder: 'buildtime'
        });
        expect(dialog.isPipelineSelectionDisabled('pipeline-1')).to.be.true;
        expect(dialog.isPipelineSelectionDisabled('pipeline-2')).to.be.true;
        expect(dialog.isPipelineSelectionDisabled('pipeline-3')).to.be.true;
        expect(dialog.isPipelineSelectionDisabled('pipeline-4')).to.be.true;
      })
    });
  });
});
