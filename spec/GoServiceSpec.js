import { describe, before, after, it } from 'mocha';
import mockery from 'mockery';
import fs from 'fs';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

describe('GoService spec', () => {

  // Chai setup
  chai.use(chaiAsPromised);
  const expect = chai.expect;

  let GoService;
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
    // DB mock
    mockery.registerMock('nedb', () => { 
      return {
        findOne: () => {
        }
      }
    });

    // Init GoService
    GoService = require('../server/services/GoService').default;

    done();
  });

  after((done) => {
    mockery.disable();
    mockery.deregisterAll();
    done();
  });

  describe('#constructor()', () => {

    it('should set properties when created', () => {
      let goService = new GoService();

      expect(goService).to.be.ok;
      expect(goService.baseUrl).to.be.a('string');
      expect(goService.user).to.be.a('string');
      expect(goService.password).to.be.a('string');
      expect(goService.pollingInterval).to.be.a('number');
      expect(goService.pipelines).to.be.an('array');
      expect(goService.clients).to.be.an('array');
    });

  });

  describe('#getAllPipelines()', () => {

    it('should parse go pipelines.xml', (done) => {
      mockedRequestPromise = Promise.resolve(fs.readFileSync(__dirname + '/data/pipelines.xml', 'utf-8'));
      let pipelinesPromise = new GoService().getAllPipelines();

      expect(pipelinesPromise).to.eventually.be.ok;
      expect(pipelinesPromise).to.eventually.have.length(2);
      expect(pipelinesPromise).to.eventually.contain('go-pipeline-1').and.notify(done);
    });

    it('should return throw error if promise is rejected', (done) => {
      mockedRequestPromise = Promise.reject({ message: 'Fake error' });
      let pipelinePromise = new GoService().getAllPipelines();

      expect(pipelinePromise).to.be.rejected.and.notify(done);
    });
  });

  describe('#getPipelineHistory()', () => {

    it('should parse go pipelines', (done) => {
      mockedRequestPromise = Promise.resolve(JSON.parse(fs.readFileSync(__dirname + '/data/pipeline.json', 'utf-8')));
      let pipelinePromise = new GoService().getPipelineHistory('pipeline1');

      expect(pipelinePromise).to.eventually.be.ok;
      expect(pipelinePromise).to.eventually.have.property('name');
      expect(pipelinePromise).to.eventually.have.property('author');
      expect(pipelinePromise).to.eventually.have.property('buildtime');
      expect(pipelinePromise).to.eventually.have.property('counter');
      expect(pipelinePromise).to.eventually.have.property('health').and.notify(done);
    });

    it('should return undefined if promise is rejected and pipelines are empty', (done) => {
      mockedRequestPromise = Promise.reject({ message: 'Fake error' });
      let pipelinePromise = new GoService().getPipelineHistory('pipeline1');

      expect(pipelinePromise).to.eventually.be.undefined.and.notify(done);
    });

    it('should return last known pipeline result if promise is rejected', (done) => {
      mockedRequestPromise = Promise.reject({ message: 'Fake error' });
      let goService = new GoService();
      let lastPipelineResult = { name: 'pipeline1', results: [] };
      goService.pipelines = [lastPipelineResult, { name: 'pipeline2', results: [] }];
      let pipelinePromise = goService.getPipelineHistory(lastPipelineResult.name);

      expect(pipelinePromise).to.eventually.be.equal(lastPipelineResult).and.notify(done);
    });

  });

  describe('#(un)registerClient()', () => {

    it('should register a client', (done) => {
      let goService = new GoService();
      expect(goService.clients).to.have.lengthOf(0);

      goService.registerClient({ id: 'client1', on: () => { }, emit: () => { } });
      expect(goService.clients).to.have.lengthOf(1);

      done();
    });

    it('should not register client if client is already registered', (done) => {
      let goService = new GoService();
      let client = { id: 'client1', on: () => { }, emit: () => { } };

      goService.registerClient(client);
      expect(goService.clients).to.have.lengthOf(1);
      goService.registerClient(client);
      expect(goService.clients).to.have.lengthOf(1);

      done();
    });

    it('should unregister a client', (done) => {
      let goService = new GoService();
      let client = { id: 'client1', on: () => { }, emit: () => { } };

      goService.registerClient(client);
      expect(goService.clients).to.have.lengthOf(1);

      goService.unregisterClient(client);
      expect(goService.clients).to.have.lengthOf(0);

      done();
    });

    it('should not affect client list if a client that does not exists is unregistered', (done) => {
      let goService = new GoService();
      let client = { id: 'client1', on: () => { }, emit: () => { } };

      expect(goService.clients).to.have.lengthOf(0);
      goService.unregisterClient(client);
      expect(goService.clients).to.have.lengthOf(0);

      done();
    });

  });

});
