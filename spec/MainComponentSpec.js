import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';

import Main from '../client/components/Main';

describe('MainComponent spec', () => {

  describe('#sortPipelines()', () => {

    const generatePipelines = () => {
      return [{
        name: 'pipeline1',
        buildtime: 1234,
        active: true
      }, {
        name: 'pipeline2',
        buildtime: 2345,
        active: true
      },
      {
        name: 'pipeline3',
        buildtime: 1111,
        active: true
      },
      {
        name: 'pipeline4',
        buildtime: 2222,
        active: true
      }]
    };

    it('should filter undefined pipelines', () => {
      let mainComponent = new Main();
      let pipelines = generatePipelines();

      expect(pipelines).to.have.lengthOf(4);
      pipelines[0] = null;
      expect(mainComponent.sortPipelines(pipelines, 'buildtime')).to.have.lengthOf(3);
    });

    it('should sort pipelines by buildtime', () => {
      let mainComponent = new Main();
      let pipelines = generatePipelines();

      let sortedPipelineNames = mainComponent.sortPipelines(pipelines, 'buildtime').map(p => p.name);
      expect(sortedPipelineNames).to.eql(['pipeline2', 'pipeline4', 'pipeline1', 'pipeline3']);
    });
  });

});
