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

    it('should set properties when created', (done) => {
      let goService = new GoService();

      expect(goService).to.be.ok;
      expect(goService.baseUrl).to.be.a('string');
      expect(goService.user).to.be.a('string');
      expect(goService.password).to.be.a('string');
      expect(goService.pipelines).to.be.an('array');
      expect(goService.clients).to.be.an('array');
      done();
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
      mockedRequestPromise = Promise.reject({ message : 'Fake error' });
      let pipelinePromise = new GoService().getAllPipelines();

      expect(pipelinePromise).to.be.rejected.and.notify(done);
    });
  });

  describe('#getPipelineHistory()', () => {

    it('should parse go pipeline history', (done) => {
      mockedRequestPromise = Promise.resolve(JSON.parse(fs.readFileSync(__dirname + '/data/pipeline.json', 'utf-8')));
      let pipelinePromise = new GoService().getPipelineHistory('pipeline1');

      expect(pipelinePromise).to.eventually.be.ok;
      expect(pipelinePromise).to.eventually.have.property('name');
      expect(pipelinePromise).to.eventually.have.property('results').and.notify(done);
    });

    it('should return null if promise is rejected', (done) => {
      mockedRequestPromise = Promise.reject({ message : 'Fake error' });
      let pipelinePromise = new GoService().getPipelineHistory('pipeline1');

      expect(pipelinePromise).to.eventually.be.null.and.notify(done);
    });
  });

});
