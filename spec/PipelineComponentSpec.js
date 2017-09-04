import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';

import Pipeline from '../client/components/Pipeline';

describe('PipelineComponent spec', () => {

  describe('#weatherIcon()', () => {

    it('should be sunny when health is 0', () => {
      const pipelineComponent = new Pipeline();
      const pipeline = {
        name: 'pipeline1',
        health: 0
      };

      expect(pipelineComponent.weatherIcon(pipeline)).to.be.equal('sunny');
    });

    it('should be lightning when health is 5', () => {
      const pipelineComponent = new Pipeline();
      const pipeline = {
        name: 'pipeline1',
        health: 5
      };

      expect(pipelineComponent.weatherIcon(pipeline)).to.be.equal('lightning');
    });

  });

  describe('#status()', () => {

    it('should be passed when all stage results has passed', () => {
      const pipeline = {
        stageresults: [{ status: 'passed' }, { status: 'passed' }]
      };

      expect(Pipeline.status(pipeline)).to.be.equal('passed');
    });

    it('should be paused when pause info is paused', () => {
      const pipeline = {
        pauseinfo: {
          paused: true
        },
        stageresults: [{ status: 'passed' }, { status: 'passed' }]
      };

      expect(Pipeline.status(pipeline)).to.be.equal('paused');
    });

    it('should be failed when one stage has failed', () => {
      const pipeline = {
        stageresults: [{ status: 'passed' }, { status: 'passed' }, { status: 'failed' }]
      };

      expect(Pipeline.status(pipeline)).to.be.equal('failed');
    });

    it('should be cancelled when one stage has cancelled', () => {
      const pipeline = {
        stageresults: [{ status: 'passed' }, { status: 'passed' }, { status: 'cancelled' }]
      };

      expect(Pipeline.status(pipeline)).to.be.equal('cancelled');
    });

    it('should be building when one stage is building', () => {
      const pipeline = {
        stageresults: [{ status: 'passed' }, { status: 'building' }, { status: 'unknown' }]
      };

      expect(Pipeline.status(pipeline)).to.be.equal('building');
    });

  });

  describe('#shouldComponentUpdate()', () => {

    it('should update if time ago string has changed', () => {
      const pipelineComponent = new Pipeline();
      const currPipeline = {
        timeago: 'A few seconds ago',
        stageresults: [{ status: 'passed' }, { status: 'building' }, { status: 'unknown' }]
      };
      const nextPipeline = {
        timeago: '1 minute ago',
        stageresults: [{ status: 'passed' }, { status: 'building' }, { status: 'unknown' }]
      };

      pipelineComponent.props = {
        pipeline: currPipeline
      }

      expect(pipelineComponent.shouldComponentUpdate({ pipeline: nextPipeline })).to.be.true;

    });

    it('should update if any stage status has changed', () => {
      const pipelineComponent = new Pipeline();
      const currPipeline = {
        timeago: '1 minute ago',
        stageresults: [{ status: 'passed' }, { status: 'building' }, { status: 'unknown' }]
      };
      const nextPipeline = {
        timeago: '1 minute ago',
        stageresults: [{ status: 'passed' }, { status: 'passed' }, { status: 'building' }]
      };

      pipelineComponent.props = {
        pipeline: currPipeline
      }

      expect(pipelineComponent.shouldComponentUpdate({ pipeline: nextPipeline })).to.be.true;

    });

    it('should not update if stage status and time ago string is same', () => {
      const pipelineComponent = new Pipeline();
      const currPipeline = {
        timeago: '1 minute ago',
        stageresults: [{ status: 'passed' }, { status: 'building' }, { status: 'unknown' }]
      };
      const nextPipeline = {
        timeago: '1 minute ago',
        stageresults: [{ status: 'passed' }, { status: 'building' }, { status: 'unknown' }]
      };

      pipelineComponent.props = {
        pipeline: currPipeline
      }

      expect(pipelineComponent.shouldComponentUpdate({ pipeline: nextPipeline })).to.be.false;

    });

  });

});
