import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';

import Configuration from '../client/components/Configuration';

describe('ConfigurationComponent spec', () => {

  describe('#setupPipelines()', () => {

  const props = {
      pipelines : [{
        name: 'pipeline3'
      },
      {
        name: 'pipeline1'
      },
      {
        name: 'pipeline2'
      }],
      settings: {
        disabledPipelines: ['pipeline4'],
        sortOrder: {
          name: 'buildtime',
          label: ''
        }
      }
    }

    it('should sort pipelines by name', () => {
      let configurationComponent = new Configuration(props);
      const pipelines = configurationComponent.setupPipelines(props.pipelines, props.settings.disabledPipelines);

      expect(pipelines).to.not.be.equal(props.pipelines);
      expect(pipelines[0].name).to.be.equal('pipeline1');
      expect(pipelines[1].name).to.be.equal('pipeline2');
      expect(pipelines[2].name).to.be.equal('pipeline3');
      expect(pipelines[3].name).to.be.equal('pipeline4');
    });

    it('should set disabled pipelines to not active', () => {
      let configurationComponent = new Configuration(props);
      const pipelines = configurationComponent.setupPipelines(props.pipelines, props.settings.disabledPipelines);

      expect(pipelines[0].active).to.be.true;
      expect(pipelines[3].active).to.be.false;
    });

  });

});
