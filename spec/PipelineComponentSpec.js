import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';

import Pipeline from '../client/components/Pipeline';

describe('PipelineComponent spec', () => {

  describe('#weatherIcon()', () => {

    it('should be sunny when health is 0', () => {
      let pipelineComponent = new Pipeline();
      let pipeline = {
        name: 'pipeline1',
        health: 0
      };

      expect(pipelineComponent.weatherIcon(pipeline)).to.be.equal('sunny');
    });

    it('should be lightning when health is 5', () => {
      let pipelineComponent = new Pipeline();
      let pipeline = {
        name: 'pipeline1',
        health: 5
      };

      expect(pipelineComponent.weatherIcon(pipeline)).to.be.equal('lightning');
    });

  });

});
