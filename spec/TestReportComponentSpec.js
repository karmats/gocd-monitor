import { describe, before, after, it } from 'mocha';
import mockery from 'mockery';
import { chai, expect } from 'chai';


describe('TestReport spec', () => {

  let TestReport;

  before((done) => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    // Mock the chart.js library
    mockery.registerMock('chart.js', {
      defaults: {
        global: {
          defaultFontColor: '',
          defaultFontFamily: ''
        }
      }
    });

    // Init TestReport
    TestReport = require('../client/components/TestReport').default;

    done();
  });

  after((done) => {
    mockery.disable();
    mockery.deregisterAll();
    done();
  });

  describe('#constructor()', () => {

    const props = {
      report: {
        title: 'report1',
        history: [{
          when: 1466947875660,
          passed: 23,
          failed: 0
        }]
      },
    };

    it('should convert props to state', () => {
      const testReportComponent = new TestReport(props);

      expect(testReportComponent.state).to.have.property('report');
      expect(testReportComponent.state).to.have.property('chartData');
      expect(testReportComponent.state).to.have.property('latest');
      expect(testReportComponent.state).to.have.property('first');
    });

  });



});
