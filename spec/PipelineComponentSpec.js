import { describe, before, after, it } from 'mocha';
import { chai, expect } from 'chai';

import Pipeline from '../client/components/Pipeline';

describe('PipelineComponent spec', () => {

  describe('#weatherIcon()', () => {

    it('should be sunny when health is 0', () => {
      let pipelineComponent = new Pipeline();
      let pipeline = {
        name: 'pipeline1',
        health: 0
      };

      expect(pipelineComponent.weatherIcon(pipeline)).to.be.equal('sunny');
    });

    it('should be lightning when health is 5', () => {
      let pipelineComponent = new Pipeline();
      let pipeline = {
        name: 'pipeline1',
        health: 5
      };

      expect(pipelineComponent.weatherIcon(pipeline)).to.be.equal('lightning');
    });

  });

  describe('#status()', () => {

    it('should be passed when all stage results has passed', () => {
      let pipeline = {
        stageresults: [{status: 'passed'}, {status: 'passed'}] 
      };

      expect(Pipeline.status(pipeline)).to.be.equal('passed');
    });

    it('should be paused when all pipeline is paused', () => {
      let pipeline = {
        paused: true,
        stageresults: [{status: 'passed'}, {status: 'passed'}] 
      };

      expect(Pipeline.status(pipeline)).to.be.equal('paused');
    });

    it('should be failed when one stage has failed', () => {
      let pipeline = {
        stageresults: [{status: 'passed'}, {status: 'passed'}, {status: 'failed'}] 
      };

      expect(Pipeline.status(pipeline)).to.be.equal('failed');
    });

    it('should be building when one stage is building', () => {
      let pipeline = {
        stageresults: [{status: 'passed'}, {status: 'building'}, {status: 'unknown'}] 
      };

      expect(Pipeline.status(pipeline)).to.be.equal('building');
    });

  });

});
