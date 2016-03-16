import rp from 'request-promise';
import * as conf from '../../app-config';
import { parseString } from 'xml2js';

import Service from './Service';

export default class GoService extends Service {

  constructor() {
    super();
    this.baseUrl = conf.goServerUrl + '/go/api';
    this.user = conf.goUser;
    this.password = conf.goPassword;
    this.pipelines = [];
  }

  /**
   * Start polling go server for pipeline results
   */
  startPolling() {
    // Function that refreshes all pipelines
    let refreshPipelines = (pipelineNames) => {
      let currentPipelines = [];
      pipelineNames.forEach((name) => {
        this.getPipelineHistory(name).then((pipeline) => {
          currentPipelines.push(pipeline);
          if (currentPipelines.length === pipelineNames.length) {
            this.pipelines = currentPipelines;
            console.log(`Emitting ${this.pipelines.length} pipelines to ${this.clients.length} clients`);
            this.clients.forEach((client) => {
              client.emit('pipelines:update', this.pipelines);
            })
          }
        });
      });
    };

    // Fetch the pipelines and start polling pipeline history
    this.getAllPipelines()
      .then((pipelineNames) => {
        refreshPipelines(pipelineNames);
        setInterval(refreshPipelines, conf.goPollingInterval, pipelineNames);
      })
      .catch((err) => {
        console.error(err);
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
   * @returns {Object}    Pipeline instance. Example { name : 'id, results: [{'status' : 'passed', 'buildtime' : 1457085089646, author: 'Bobby Malone', counter: 255}] }
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
        console.error(`Failed to get pipeline history for pipeline ${name}, ${err.statusCode}: ${err.message}`);
        return null;
      });
  }

  _goPipelinesToPipelineResult(pipelines) {
    let result = {};

    if (pipelines.length <= 0) {
      return {};
    }

    // Pipeline name
    result.name = pipelines[0].name;

    // Pipeline is paused if can_run property is set to false
    let paused = !pipelines[0].can_run;

    // Result array
    result.results = pipelines.map((p) => {
      let res = {};

      // Status
      if (p.stages.some(stage => stage.result === 'Unknown')) {
        res.status = 'building';
      } else if (paused) {
        res.status = 'paused';
      } else {
        res.status = p.stages.every(stage => stage.result === 'Passed') ? 'passed' : 'failed';
      }

      // Bulid time = last scheduled job
      res.buildtime = p.stages.reduce((sp, sc) => {
        let lastScheduledJob = sc.jobs.reduce((jp, jc) => {
          if (jc.scheduled_date > jp) {
            jp = jc.scheduled_date;
          }
          return jp;
        }, 0);
        if (lastScheduledJob > sp) {
          sp = lastScheduledJob;
        }
        return sp;
      }, 0);

      // Author = first modifcator
      if (p.build_cause && p.build_cause.material_revisions && p.build_cause.material_revisions[0].modifications) {
        res.author = p.build_cause.material_revisions[0].modifications[0].user_name;
      } else {
        res.author = 'Unknown';
      }
      // Remove email tag if any
      let tagIdx = res.author.indexOf('<');
      if (tagIdx > 0) {
        res.author = res.author.substring(0, tagIdx).trim();
      }

      // Counter id
      res.counter = p.counter;
      return res;
    });
    return result;
  }
}
