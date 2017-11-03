import { describe, before, after, it } from 'mocha';
import mockery from 'mockery';
import fs from 'fs';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

describe('GoBuildService spec', () => {

  // Chai setup
  chai.use(chaiAsPromised);
  const expect = chai.expect;

  // Config
  const config = {
    serverUrl: 'https://ci.example.com',
    user: 'user',
    password: 'password'
};

  let GoBuildService;
  // The promise to return when request-promise is called
  let mockedRequestPromise;

  before((done) => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    // Mock the request-promise results
    mockery.registerMock('request-promise', (options) => {
      return mockedRequestPromise;
    });

    // Init GoBuildService
    GoBuildService = require('../server/services/GoBuildService').default;

    done();
  });

  after((done) => {
    mockery.disable();
    mockery.deregisterAll();
    done();
  });

  describe('#constructor()', () => {

    it('should set properties when created', () => {
      let goBuildService = new GoBuildService(config);

      expect(goBuildService).to.be.ok;
      expect(goBuildService.conf.serverUrl).to.be.a('string');
      expect(goBuildService.conf.user).to.be.a('string');
      expect(goBuildService.conf.password).to.be.a('string');
    });

  });

  describe('#getAllPipelines()', () => {

    it('should parse go pipelines.xml', () => {
      mockedRequestPromise = Promise.resolve(fs.readFileSync(__dirname + '/data/pipelines.xml', 'utf-8'));
      let pipelinesPromise = new GoBuildService(config).getAllPipelines();

      return pipelinesPromise.then(pipelines => {
        expect(pipelines).to.be.ok;
        expect(pipelines).to.have.length(2);
        expect(pipelines).to.contain('go-pipeline-1');
      });
    });

    it('should return throw error if promise is rejected', () => {
      mockedRequestPromise = Promise.reject({ message: 'Fake error' });
      let pipelinePromise = new GoBuildService(config).getAllPipelines();

      return expect(pipelinePromise).to.be.rejected;
    });
  });

  describe('#getPipelineHistory()', () => {

    it('should parse go pipelines', () => {
      mockedRequestPromise = Promise.resolve(JSON.parse(fs.readFileSync(__dirname + '/data/pipeline.json', 'utf-8')));
      let pipelinePromise = new GoBuildService(config).getPipelineHistory('pipeline1');

      return pipelinePromise.then(pipeline => {
        expect(pipeline).to.have.property("name");
        expect(pipeline).to.have.property("author");
        expect(pipeline).to.have.property("label");
        expect(pipeline).to.have.property("buildtime");
        expect(pipeline).to.have.property("counter");
        expect(pipeline).to.have.property("health");
      });
    });

    it('should return null if promise is rejected and pipelines are empty', () => {
      mockedRequestPromise = Promise.reject({ message: 'Fake error' });
      let pipelinePromise = new GoBuildService(config).getPipelineHistory('pipeline1');

      return expect(pipelinePromise).to.eventually.be.null;
    });

    it('should return last known pipeline result if promise is rejected', () => {
      mockedRequestPromise = Promise.reject({ message: 'Fake error' });
      let goBuildService = new GoBuildService(config);
      let lastPipelineResult = { name: 'pipeline1', results: [] };
      goBuildService.pipelines = [lastPipelineResult, { name: 'pipeline2', results: [] }];
      let pipelinePromise = goBuildService.getPipelineHistory(lastPipelineResult.name);

      return expect(pipelinePromise).to.eventually.be.equal(lastPipelineResult);
    });

  });

  describe('#getPipelinesPauseInfo()', () => {

    it('should retrieve pipeline pause info', () => {
      mockedRequestPromise = Promise.resolve(JSON.parse(fs.readFileSync(__dirname + '/data/dashboard.json', 'utf-8')));
      let pipelinePromise = new GoBuildService(config).getPipelinesPauseInfo();

      return pipelinePromise.then(pipeline => {
        expect(pipeline).to.be.ok;
        expect(pipeline).to.have.property('first');
        expect(pipeline).to.have.deep.nested.property('first.paused', true);
        expect(pipeline).to.have.deep.nested.property('first.paused_by', 'admin');
        expect(pipeline).to.have.deep.nested.property('first.pause_reason', 'under construction');
      });
    });

    it('should return empty object if promise is rejected', () => {
      mockedRequestPromise = Promise.reject({ message: 'Fake error'});
      let pipelinePromise = new GoBuildService(config).getPipelinesPauseInfo();

      return pipelinePromise.then(pipeline => {
        expect(pipeline).to.be.ok;
        expect(pipeline).to.be.empty;
      });
    });

  });

});