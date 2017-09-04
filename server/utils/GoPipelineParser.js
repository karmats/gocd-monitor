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
   *    health: 2,
   *    stageresults: [
   *      {
   *        name: 'Build',
   *        status: 'passed',
   *        counter: 1,
   *        jobresults: [{
   *          name: 'build-job',
   *          result: 'passed',
   *          scheduled: 1457085089646
   *        }]
   *      },
   *      {
   *        name: 'Test',
   *        status: 'building',
   *        counter: 2,
   *        jobresults: []
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
      if (stage.result === 'Cancelled') stageResult.status = 'cancelled';
      else if (stage.jobs.some(job => job.state === 'Scheduled' || job.state === 'Assigned' || job.state === 'Preparing' || job.state === 'Building' || job.state === 'Completing')) {
        stageResult.status = 'building';
      } else {
        stageResult.status = stage.result ? stage.result.toLowerCase() : 'unknown';
      }
      stageResult.jobresults = stage.jobs.map((job) => {
        return {
          name: job.name,
          result: job.state.toLowerCase(),
          scheduled: job.scheduled_date
        }
      })
      return stageResult;
    });

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

    // Author = first modifcator or approver
    let author = 'Unknown';
    const validAuthor = (auth) => {
      return auth && auth !== 'Unknown' &&  auth !== 'changes' && auth !== 'anonymous' && auth !== 'timer';
    }
    const buildCause = latestPipelineResult.build_cause;
    if (buildCause && buildCause.material_revisions && buildCause.material_revisions[0].modifications) {
      author = buildCause.material_revisions[0].modifications[0].user_name;
    }
    if (!validAuthor(author)) {
      if (validAuthor(buildCause.approver)) {
        author = buildCause.approver;
      } else {
        author = latestPipelineResult.stages.reduce((auth, c) => {
          if (!validAuthor(auth) && validAuthor(c.approved_by)) {
            return c.approved_by;
          }
          return auth;
        }, author);
      }
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
