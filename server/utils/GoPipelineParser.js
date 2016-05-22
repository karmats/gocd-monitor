import { parseString } from 'xml2js';

/**
 * Parses pipeline data retrieved from Go
 */
export default class GoPipelineParser {

  /**
   * Parse pipeline.xml from go server. See spec/data/pipelines.xml for example
   * 
   * @return {Promise<Array<string>>} Array with pipeline names
   */
  static parsePipelineNames(pipelineXml) {
    return new Promise((resolve, reject) => {
      parseString(pipelineXml, (err, parsed) => {
        if (err) {
          throw reject(err);
        }
        // pipline xml in format {baseUrl}/pipelines/{name}/stages.xml
        resolve(parsed.pipelines.pipeline.map(p => p.$.href.match(/go\/api\/pipelines\/(.*)\/stages.xml/)[1]));
      });
    });
  }

  /**
    * @param   {Array<Object}    pipelineHistory  History for a pipeline, see spec/data/pipeline.json for example
    * @returns {Object}          Pipeline instance. 
    * Example 
    * { 
    *    name : 'id,
    *    buildtime : 1457085089646,
    *    author: 'Bobby Malone',
    *    counter: 255,
    *    paused: false,
    *    health: 2,
    *    stageresults: [
    *      {
    *        name: 'Build',
    *        status: 'passed'
    *      },
    *      {
    *        name: 'Test',
    *        status: 'building'
    *      }] 
    * }
    */
  static parsePipelineResult(pipelines) {
    let result = {};

    if (pipelines.length <= 0) {
      return {};
    }

    // Latest pipeline result is where we will retrieve most data
    let latestPipelineResult = pipelines[0];

    // Pipeline name
    result.name = latestPipelineResult.name;

    // Stage results
    result.stageresults = latestPipelineResult.stages.map((stage) => {
      let stageResult = { name: stage.name, counter: stage.counter };
      if (stage.jobs.some(job => job.state === 'Scheduled' || job.state === 'Assigned' || job.state === 'Preparing' || job.state === 'Building' || job.state === 'Completing')) {
        stageResult.status = 'building';
      } else {
        stageResult.status = stage.result ? stage.result.toLowerCase() : 'unknown';
      }
      stageResult.jobresults = stage.jobs.map((job) => {
        return {
          name: job.name,
          result: job.state.toLowerCase()
        }
      })
      return stageResult;
    });

    // Pipeline is paused if none of the stagues can run and the pipeline isn't building
    result.paused = !result.stageresults.some(stageResult => stageResult.status === 'building') && latestPipelineResult.stages.every((stage) => stage.can_run === false);

    // Health = number of pipelines failed
    result.health = pipelines.reduce((p, c) => {
      if (c.stages.some(stage => stage.result === 'Failed')) {
        return p + 1;
      }
      return p;
    }, 0);

    // Bulid time = last scheduled job
    result.buildtime = latestPipelineResult.stages.reduce((sp, sc) => {
      let lastScheduledJob = sc.jobs.reduce((jp, jc) => {
        if (jc.scheduled_date > jp) {
          return jc.scheduled_date;
        }
        return jp;
      }, 0);
      if (lastScheduledJob > sp) {
        sp = lastScheduledJob;
      }
      return sp;
    }, 0);

    // Author = first modifcator
    let author = 'Unknown';
    if (latestPipelineResult.build_cause && latestPipelineResult.build_cause.material_revisions && latestPipelineResult.build_cause.material_revisions[0].modifications) {
      author = latestPipelineResult.build_cause.material_revisions[0].modifications[0].user_name;
    }
    // Remove email tag if any
    let tagIdx = author.indexOf('<');
    if (tagIdx > 0) {
      author = author.substring(0, tagIdx).trim();
    }
    result.author = author;

    // Counter id
    result.counter = latestPipelineResult.counter;

    return result;
  }

}
