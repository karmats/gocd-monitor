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

  // Mocked promises
  let mockedFilesPromise;
  let mockedCucumberPromise;

  // Test service
  let GoTestService = require('../server/services/GoTestService').default;

  before((done) => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    // Mock the request-promise results
    mockery.registerMock('request-promise', (options) => {
      if (options.uri.endsWith('/go/files/dummy.json')) {
        return mockedFilesPromise;
      }
      return mockedCucumberPromise;
    });

    // Init GoTestService
    GoTestService = require('../server/services/GoTestService').default;

    done();
  });

  after((done) => {
    mockery.disable();
    mockery.deregisterAll();
    done();
  });

  describe('#getTestsFromUri()', () => {

    it('should retrieve all cucumber json files from uri and parse the files', (done) => {
      mockedFilesPromise = Promise.resolve(JSON.parse(fs.readFileSync(__dirname + '/data/files.json', 'utf-8')));
      mockedCucumberPromise = Promise.resolve(JSON.parse(fs.readFileSync(__dirname + '/data/cucumber.json', 'utf-8')));

      let testsPromise = new GoTestService(config).getTestsFromUri(`${config.serverUrl}/go/files/dummy.json`);

      expect(testsPromise).to.eventually.be.ok;
      expect(testsPromise).to.eventually.have.length(1);
      expect(testsPromise).to.eventually.have.deep.property('[0].type', 'cucumber').and.notify(done)
    });

    it('should be rejected if json file throws error', (done) => {
      // Mock promise reject
      mockedFilesPromise = Promise.reject('File error');

      // Init GoTestService
      GoTestService = require('../server/services/GoTestService').default;

      let testsPromise = new GoTestService(config).getTestsFromUri(`${config.serverUrl}/go/files/dummy.json`);

      expect(testsPromise).to.eventually.be.rejected.and.notify(done);
    });

    it('should be rejected if cucumber json can\'t be retrieved', (done) => {
      // Mock promise reject
      mockedFilesPromise = Promise.resolve(JSON.parse(fs.readFileSync(__dirname + '/data/files.json', 'utf-8')));
      mockedCucumberPromise = Promise.reject('Cucumber error');

      // Init GoTestService
      GoTestService = require('../server/services/GoTestService').default;

      let testsPromise = new GoTestService(config).getTestsFromUri(`${config.serverUrl}/go/files/dummy.json`);

      expect(testsPromise).to.eventually.be.rejected.and.notify(done);
    });

  });

});
