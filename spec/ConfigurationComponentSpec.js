import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';

import Configuration from '../client/components/Configuration';

describe('ConfigurationComponent spec', () => {

  describe('#constructor()', () => {

  const props = {
      pipelines : [
        'pipeline3',
        'pipeline1',
        'pipeline4',
        'pipeline2'],
      disabledPipelines: ['pipeline4'],
      sortOrder: {
        name: 'buildtime',
        label: ''
      }
    }

    it('should sort pipelines by name', () => {
      let configurationComponent = new Configuration(props);

      expect(configurationComponent.state.pipelines).to.not.be.equal(props.pipelines);
      expect(configurationComponent.state.pipelines[0].name).to.be.equal('pipeline1');
      expect(configurationComponent.state.pipelines[1].name).to.be.equal('pipeline2');
      expect(configurationComponent.state.pipelines[2].name).to.be.equal('pipeline3');
      expect(configurationComponent.state.pipelines[3].name).to.be.equal('pipeline4');
    });

    it('should set disabled pipelines to not active', () => {
      let configurationComponent = new Configuration(props);

      expect(configurationComponent.state.pipelines[0].active).to.be.true;
      expect(configurationComponent.state.pipelines[3].active).to.be.false;
    });

  });

});
