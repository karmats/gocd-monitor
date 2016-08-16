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

    it('should parse go pipelines.xml', (done) => {
      mockedRequestPromise = Promise.resolve(fs.readFileSync(__dirname + '/data/pipelines.xml', 'utf-8'));
      let pipelinesPromise = new GoBuildService(config).getAllPipelines();

      expect(pipelinesPromise).to.eventually.be.ok;
      expect(pipelinesPromise).to.eventually.have.length(2);
      expect(pipelinesPromise).to.eventually.contain('go-pipeline-1').and.notify(done);
    });

    it('should return throw error if promise is rejected', (done) => {
      mockedRequestPromise = Promise.reject({ message: 'Fake error' });
      let pipelinePromise = new GoBuildService(config).getAllPipelines();

      expect(pipelinePromise).to.be.rejected.and.notify(done);
    });
  });

  describe('#getPipelineHistory()', () => {

    it('should parse go pipelines', (done) => {
      mockedRequestPromise = Promise.resolve(JSON.parse(fs.readFileSync(__dirname + '/data/pipeline.json', 'utf-8')));
      let pipelinePromise = new GoBuildService(config).getPipelineHistory('pipeline1');

      expect(pipelinePromise).to.eventually.be.ok;
      expect(pipelinePromise).to.eventually.have.property('name');
      expect(pipelinePromise).to.eventually.have.property('author');
      expect(pipelinePromise).to.eventually.have.property('buildtime');
      expect(pipelinePromise).to.eventually.have.property('counter');
      expect(pipelinePromise).to.eventually.have.property('health').and.notify(done);
    });

    it('should return null if promise is rejected and pipelines are empty', (done) => {
      mockedRequestPromise = Promise.reject({ message: 'Fake error' });
      let pipelinePromise = new GoBuildService(config).getPipelineHistory('pipeline1');

      expect(pipelinePromise).to.eventually.be.null.and.notify(done);
    });

    it('should return last known pipeline result if promise is rejected', (done) => {
      mockedRequestPromise = Promise.reject({ message: 'Fake error' });
      let goBuildService = new GoBuildService(config);
      let lastPipelineResult = { name: 'pipeline1', results: [] };
      goBuildService.pipelines = [lastPipelineResult, { name: 'pipeline2', results: [] }];
      let pipelinePromise = goBuildService.getPipelineHistory(lastPipelineResult.name);

      expect(pipelinePromise).to.eventually.be.equal(lastPipelineResult).and.notify(done);
    });

  });

  describe('#getPipelinesPauseInfo()', () => {

    it('should retrieve pipeline pause info', (done) => {
      mockedRequestPromise = Promise.resolve(JSON.parse(fs.readFileSync(__dirname + '/data/dashboard.json', 'utf-8')));
      let pipelinePromise = new GoBuildService(config).getPipelinesPauseInfo();

      expect(pipelinePromise).to.eventually.be.ok;
      expect(pipelinePromise).to.eventually.have.property('first');
      expect(pipelinePromise).to.eventually.have.deep.property('first.paused', true);
      expect(pipelinePromise).to.eventually.have.deep.property('first.paused_by', 'admin');
      expect(pipelinePromise).to.eventually.have.deep.property('first.pause_reason', 'under construction').and.notify(done);
    });

    it('should return empty object if promise is rejected', (done) => {
      mockedRequestPromise = Promise.reject({ message: 'Fake error'});
      let pipelinePromise = new GoBuildService(config).getPipelinesPauseInfo();

      expect(pipelinePromise).to.eventually.be.ok;
      expect(pipelinePromise).to.eventually.be.empty.and.notify(done);
    });

  });

});
