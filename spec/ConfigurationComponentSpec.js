import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';

import Configuration from '../client/components/Configuration';

describe('ConfigurationComponent spec', () => {

  describe('#constructor()', () => {

    it('should sort pipelines by name', () => {
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
          disabledPipelines: [],
          sortOrder: {
            name: 'buildtime',
            label: ''
          }
        }
      }
      let configurationComponent = new Configuration(props);

      expect(configurationComponent.state.pipelines).to.not.be.equal(props.pipelines);
      expect(configurationComponent.state.pipelines[0].name).to.be.equal('pipeline1');
      expect(configurationComponent.state.pipelines[1].name).to.be.equal('pipeline2');
      expect(configurationComponent.state.pipelines[2].name).to.be.equal('pipeline3');
    });

  });

});
