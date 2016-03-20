import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';

import Main from '../client/components/Main';

describe('MainComponent spec', () => {

  describe('#sortPipelines()', () => {

    const generatePipelines = () => {
      return [{
        name: 'pipeline1',
        results: [
          { buildtime: 1234 }]
      }, {
          name: 'pipeline2',
          results: [
            { buildtime: 2345 }]
        },
        {
          name: 'pipeline3',
          results: [
            { buildtime: 1111 }]
        },
        {
          name: 'pipeline4',
          results: [
            { buildtime: 2222 }]
        }
      ]
    };

    it('should filter undefined pipelines', () => {
      let mainComponent = new Main();
      let pipelines = generatePipelines();

      expect(pipelines).to.have.lengthOf(4);
      pipelines[0] = null;
      expect(mainComponent.sortPipelines(pipelines)).to.have.lengthOf(3);
    });

    it('should sort pipelines by buildtime', () => {
      let mainComponent = new Main();
      let pipelines = generatePipelines();

      let sortedPipelineNames = mainComponent.sortPipelines(pipelines).map(p => p.name);
      expect(sortedPipelineNames).to.eql(['pipeline2', 'pipeline4', 'pipeline1', 'pipeline3']);
    });
  });

});
