import { describe, it } from 'mocha';
import { sortAndFilterPipelines } from '../client/components/Main';
import { expect } from 'chai';


describe('MainComponent spec', () => {

  describe('#sortAndFilterPipelines()', () => {

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

    describe('filtering', () => {
      it('should filter undefined pipelines', () => {
        const pipelines = generatePipelines();

        expect(pipelines).to.have.lengthOf(4);
        pipelines[0] = null;
        expect(sortAndFilterPipelines(pipelines, [], 'buildtime','')).to.have.lengthOf(3);
      });

      it('should filter pipelines that are disabled', () => {
        const pipelines = generatePipelines();

        const filteredPipelineNames = sortAndFilterPipelines(pipelines, ['pipeline4','pipeline1'], 'buildtime','').map(p => p.name);
        expect(filteredPipelineNames).to.eql(['pipeline2', 'pipeline3']);
      });

      it('should filter pipelines that dont match the filter-regex', () => {
        const pipelines = generatePipelines();

        const filteredPipelineNames = sortAndFilterPipelines(pipelines, [], 'buildtime','pipeline[2-3]').map(p => p.name);
        expect(filteredPipelineNames).to.eql(['pipeline2', 'pipeline3']);
      });

      it('should filter pipelines that are disabled even if the regex filter matches', () => {
        const pipelines = generatePipelines();

        const filteredPipelineNames = sortAndFilterPipelines(pipelines, ['pipeline2'], 'buildtime','pipeline[2-3]').map(p => p.name);
        expect(filteredPipelineNames).to.eql(['pipeline3']);
      });
    });

    describe('sorting', () => {
      it('should sort pipelines by buildtime', () => {
        const pipelines = generatePipelines();

        const sortedPipelineNames = sortAndFilterPipelines(pipelines, [], 'buildtime','').map(p => p.name);
        expect(sortedPipelineNames).to.eql(['pipeline2', 'pipeline4', 'pipeline1', 'pipeline3']);
      });

      it('should sort pipelines by status', () => {
        const pipelines = generatePipelines();

        const sortedPipelineNames = sortAndFilterPipelines(pipelines, [], 'status','').map(p => p.name);
        expect(sortedPipelineNames).to.eql(['pipeline3', 'pipeline2', 'pipeline1', 'pipeline4']);
      });
    });

    it('should add time ago string', () => {
      const pipelines = generatePipelines();

      const sortedPipelines = sortAndFilterPipelines(pipelines, [], 'status','');

      sortedPipelines.forEach((p) => {
        expect(p).to.have.property('timeago');
      });
    });
  });
});
