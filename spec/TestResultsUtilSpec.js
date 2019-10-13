import { describe, it } from 'mocha';
import { expect } from 'chai';
import { sortReports, convertReport } from '../client/components/TestResultsUtil';


describe('TestResults util spec', () => {

  describe('#convertReport()', () => {

    const cucumberReport = {
      timestamp: 1466947875660,
      features: [{
        scenarios: [{
          name: 'Test Scenario',
          steps: [{
            result: 'passed'
          },
            {
              result: 'passed'
            },
            {
              result: 'failed',
              error: 'Something went work'
            }]
        }]
      }]
    }

    it('should convert cucumber report', () => {
      const report = convertReport({
        _id: 123,
        pipeline: 'TestPipeline',
        stage: 'TestStage',
        job: 'TestJob',
        cucumber: [cucumberReport]
      });

      expect(report.title).to.be.equal('TestPipeline (TestStage)');
      expect(report.subtitle).to.be.equal('TestJob');
      expect(report.history).have.lengthOf(1);
      expect(report.history[0].passed).to.be.equal(2);
      expect(report.history[0].failed).to.be.equal(1);
    });

  });

  describe('#sortReports()', () => {

    const reports = [
      {
        title: 'report1',
        history: [{
          when: 1466947875660,
          passed: 23,
          failed: 0
        }]

      },
      {
        title: 'report2',
        history: [{
          when: 1466947875661,
          passed: 23,
          failed: 2
        }]
      },
      {
        title: 'report3',
        history: [{
          when: 1466947875662,
          passed: 23,
          failed: 0
        }]
      }]

    it('should convert cucumber report', () => {
      const sortedReportTitles = reports.sort(sortReports).map(r => r.title)

      expect(sortedReportTitles).to.eql(['report2','report3','report1',]);
    });

  });

});
