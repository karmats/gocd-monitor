import { describe, before, after, it } from 'mocha';
import assert from 'assert';
import mockery from 'mockery';
import fs from 'fs';

describe('GoService spec', () => {

  before((done) => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    // Mock the request-promise results
    mockery.registerMock('request-promise', (options) => {
      let res = '';
      if (options.uri.indexOf('/pipelines.xml') >= 0) {
        res = fs.readFileSync(__dirname + '/data/pipelines.xml', 'utf-8');
      } else if (options.uri.indexOf('/history') >= 0) {
        res = JSON.parse(fs.readFileSync(__dirname + '/data/pipeline.json', 'utf-8'));
      }
      return Promise.resolve(res);
    });

    done();
  });

  after((done) => {
    mockery.disable();
    mockery.deregisterAll();
    done();
  });

  describe('#getAllPipelines()', () => {

    it('should parse go pipelines.xml', (done) => {
      let GoService = require('../server/services/GoService').default;
      return new GoService().getAllPipelines().then((res) => {
        assert.ok(res);
        assert.equal(2, res.length);
        assert.equal('go-pipeline-1', res[0]);
        done();
      })
    });

  });

  describe('#getPipelineHistory()', () => {

    it('should parse go pipeline history', (done) => {
      let GoService = require('../server/services/GoService').default;
      return new GoService().getPipelineHistory('dummy').then((res) => {
        assert.ok(res);
        assert.equal('pipeline1', res.name);
        let results = res.results;
        assert.equal(2, results.length);
        assert.equal('failed', results[0].status);
        assert.equal('passed', results[1].status);
        assert.equal('Pick E Reader', results[0].author);
        assert.ok(new Date(results[1].buildtime));
        done();
      })
    });

  });

});
