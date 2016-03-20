import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';

import Pipeline from '../client/components/Pipeline';

describe('PipelineComponent spec', () => {

  describe('#weatherIcon()', () => {

    it('should be sunny when no build has failed', () => {
      let pipelineComponent = new Pipeline();
      let pipeline = {
        name: 'pipeline1',
        results: [{ status: 'passed' }, { status: 'passed' }, { status: 'passed' }, { status: 'passed' }, { status: 'passed' }]
      };

      expect(pipelineComponent.weatherIcon(pipeline)).to.be.equal('sunny');
    });

    it('should be lightning when all builds has failed', () => {
      let pipelineComponent = new Pipeline();
      let pipeline = {
        name: 'pipeline1',
        results: [{ status: 'failed' }, { status: 'failed' }, { status: 'failed' }, { status: 'failed' }, { status: 'failed' }]
      };

      expect(pipelineComponent.weatherIcon(pipeline)).to.be.equal('lightning');
    });

  });

});
