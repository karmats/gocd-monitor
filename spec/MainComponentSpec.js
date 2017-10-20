import mockery from 'mockery';
import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';


describe('MainComponent spec', () => {

  let Main;

  const props = { route: {} };

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
        stageresults: [{ status: 'passed' }, { status: 'cancelled' }],
        paused: true,
        buildtime: 1234
      }, {
          name: 'pipeline2',
          stageresults: [{ status: 'passed' }, { status: 'passed' }, { status: 'failed' }],
          buildtime: 2345
        },
        {
          name: 'pipeline3',
          stageresults: [{ status: 'passed' }, { status: 'building' }, { status: 'unknown' }],
          buildtime: 1111
        },
        {
          name: 'pipeline4',
          stageresults: [{ status: 'passed' }, { status: 'passed' }],
          buildtime: 2222
        }]
    };

    it('should filter undefined pipelines', () => {
      const mainComponent = new Main(props);
      const pipelines = generatePipelines();

      expect(pipelines).to.have.lengthOf(4);
      pipelines[0] = null;
      expect(mainComponent.sortPipelines(pipelines, [], 'buildtime')).to.have.lengthOf(3);
    });

    it('should sort pipelines by buildtime', () => {
      const mainComponent = new Main(props);
      const pipelines = generatePipelines();

      const sortedPipelineNames = mainComponent.sortPipelines(pipelines, [], 'buildtime').map(p => p.name);
      expect(sortedPipelineNames).to.eql(['pipeline2', 'pipeline4', 'pipeline1', 'pipeline3']);
    });

    it('should sort pipelines by name', () => {
      const mainComponent = new Main(props);
      const pipelines = generatePipelines();

      const sortedPipelineNames = mainComponent.sortPipelines(pipelines, [], 'name').map(p => p.name);
      expect(sortedPipelineNames).to.eql(['pipeline1', 'pipeline2', 'pipeline3', 'pipeline4']);
    });

    it('should sort pipelines by status', () => {
      const mainComponent = new Main(props);
      const pipelines = generatePipelines();

      const sortedPipelineNames = mainComponent.sortPipelines(pipelines, [], 'status').map(p => p.name);
      expect(sortedPipelineNames).to.eql(['pipeline3', 'pipeline2', 'pipeline1', 'pipeline4']);
    });

    it('should add time ago string', () => {
      const mainComponent = new Main(props);
      const pipelines = generatePipelines();

      const sortedPipelines = mainComponent.sortPipelines(pipelines, [], 'status');

      sortedPipelines.forEach((p) => {
        expect(p).to.have.property('timeago');
      });

    });

  });

});
