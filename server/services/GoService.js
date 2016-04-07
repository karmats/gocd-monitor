import rp from 'request-promise';
import { parseString } from 'xml2js';

import Logger from '../utils/Logger';
import * as conf from '../../app-config';
import Service from './Service';


export default class GoService extends Service {

  constructor() {
    super();
    this.baseUrl = conf.goServerUrl + '/go/api';
    this.user = conf.goUser;
    this.password = conf.goPassword;
    this.pollingInterval = conf.goPollingInterval*1000;
  }

  /**
   * Start polling go server for pipeline results
   */
  startPolling() {
    // Function that refreshes all pipelines
    let refreshPipelines = (pipelineNames) => {
      let currentPipelines = [];
      const pipelinesToIgnore = this.currentSettings.disabledPipelines;
      const pipelinesToFetch = pipelineNames.filter(p => pipelinesToIgnore.indexOf(p) < 0);
      pipelinesToFetch.forEach((name) => {
        this.getPipelineHistory(name).then((pipeline) => {
          currentPipelines.push(pipeline);
          if (currentPipelines.length === pipelinesToFetch.length) {
            this.pipelines = currentPipelines;
            Logger.debug(`Emitting ${this.pipelines.length} pipelines to ${this.clients.length} clients`);
            this.clients.forEach((client) => {
              client.emit('pipelines:updated', this.pipelines);
            })
          }
        });
      });
    };

    // Fetch the pipelines and start polling pipeline history
    this.getAllPipelines()
      .then((pipelineNames) => {
        refreshPipelines(pipelineNames);
        setInterval(refreshPipelines, this.pollingInterval, pipelineNames);
      })
      .catch((err) => {
        Logger.error(err);
      });
  }

  /**
   * @returns {Array<string>} All available pipelines from the go.cd server
   */
  getAllPipelines() {
    let options = {
      uri: this.baseUrl + '/pipelines.xml',
      rejectUnauthorized: false,
      auth: {
        user: this.user,
        pass: this.password
      }
    };
    return rp(options)
      .then((res) => {
        let pipelines = [];
        // Parse response xml
        parseString(res, (err, parsed) => {
          // pipline xml in format <baseUrl>/pipelines/<name>/stages.xml
          pipelines = parsed.pipelines.pipeline.map(p => p.$.href.match(/go\/api\/pipelines\/(.*)\/stages.xml/)[1]);
        });
        return pipelines;
      })
      .catch(err => { throw err });
  }

  /**
   * @param   {string}    name       Name of the pipeline
   * @returns {Object}    Pipeline instance. Example { name : 'id, status : 'passed', buildtime : 1457085089646, author: 'Bobby Malone', counter: 255, health: 2] }
   */
  getPipelineHistory(name) {
    let options = {
      uri: this.baseUrl + '/pipelines/' + name + '/history/0',
      json: true,
      rejectUnauthorized: false,
      auth: {
        user: this.user,
        pass: this.password
      }
    };
    return rp(options)
      .then(res => this._goPipelinesToPipelineResult(res.pipelines.slice(0, 5)))
      .catch((err) => {
        Logger.error(`Failed to get pipeline history for pipeline "${name}" returning last result, ${err.statusCode}: ${err.message}`);
        return this.pipelines.filter((p) => p && p.name === name)[0];
      });
  }

  _goPipelinesToPipelineResult(pipelines) {
    let result = {};

    if (pipelines.length <= 0) {
      return {};
    }

    // Pipeline name
    result.name = pipelines[0].name;

    // Latest pipeline result is where we will retrieve most data
    let latestPipelineResult = pipelines[0];

    // Status
    if (latestPipelineResult.stages.some(stage => stage.jobs.some(job => job.state === 'Scheduled' || job.state === 'Assigned' || job.state === 'Preparing' || job.state === 'Building' || job.state === 'Completing'))) {
      result.status = 'building';
    } else if (!latestPipelineResult.stages.some(stage => stage.can_run === true)) { // Pipeline is paused if last build stages can_run property is set to false
      result.status = 'paused';
    } else { // Else consider build as failed if any of the stages has failed
      result.status = latestPipelineResult.stages.some(stage => stage.result === 'Failed') ? 'failed' : 'passed';
    }

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
