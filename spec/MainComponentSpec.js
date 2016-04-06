import mockery from 'mockery';
import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';


describe('MainComponent spec', () => {

  let Main;

  before((done) => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    // Socket io mock
    mockery.registerMock('socket.io-client', () => { });
    // Init main after mock setup
    Main = require('../client/components/Main').default;

    done();
  });

  after((done) => {
    mockery.disable();
    mockery.deregisterAll();
    done();
  });

  describe('#sortPipelines()', () => {

    const generatePipelines = () => {
      return [{
        name: 'pipeline1',
        buildtime: 1234
      }, {
        name: 'pipeline2',
        buildtime: 2345
      },
      {
        name: 'pipeline3',
        buildtime: 1111
      },
      {
        name: 'pipeline4',
        buildtime: 2222
      }]
    };

    it('should filter undefined pipelines', () => {
      let mainComponent = new Main();
      let pipelines = generatePipelines();

      expect(pipelines).to.have.lengthOf(4);
      pipelines[0] = null;
      expect(mainComponent.sortPipelines(pipelines, [], 'buildtime')).to.have.lengthOf(3);
    });

    it('should sort pipelines by buildtime', () => {
      let mainComponent = new Main();
      let pipelines = generatePipelines();

      let sortedPipelineNames = mainComponent.sortPipelines(pipelines, [], 'buildtime').map(p => p.name);
      expect(sortedPipelineNames).to.eql(['pipeline2', 'pipeline4', 'pipeline1', 'pipeline3']);
    });
  });

});
