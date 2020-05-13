import rp from 'request-promise';

import Logger from '../utils/Logger';
import GoPipelineParser from '../utils/GoPipelineParser';
import Util from '../utils/Util';

export default class GoBuildService {

  constructor(goConfig) {
    this.conf = goConfig;
  }

  /**
   * @returns {Promise<Array<string>>} All available pipelines from the go.cd server
   */
  getAllPipelines() {
    const options = Util.createRequestOptions(`${this.conf.serverUrl}/go/api/pipelines.xml`, this.conf);

    return rp(options)
      .then((res) => {
        // Parse response xml
        return GoPipelineParser.parsePipelineNames(res).then((pipelineNames) => {
          return pipelineNames;
        }, (error) => {
          Logger.error('Failed to parse pipelines.xml');
          throw error;
        });
      }).catch((err) => {
        Logger.error('Failed to retrieve pipeline names');
        throw err
      });
  }

  /**
   * @returns {Promise<Array<Object>>} All available pipeline groups from the go.cd server
   */
  getPipelineGroups() {
    const options = Util.createRequestOptions(`${this.conf.serverUrl}/go/api/config/pipeline_groups`, this.conf);

    return rp(options)
      .then((res) => {
        return JSON.parse(res);
      }).catch((err) => {
        Logger.error('Failed to retrieve pipeline groups');
        throw err
      });
  }

  /**
   * Retrive all pipelines paused info.
   * 
   * @return {Promise<Object}   
   * Example 
   * { 
   *   'pipeline1' : {
   *     paused : false,
   *     paused_by: null,
   *     pause_reason: null},
   *   'pipeline2' : {
   *     paused : true,
   *     paused_by : 'me',
   *     pause_reason : 'Under construction'
   *   }
   * }
   */
  getPipelinesPauseInfo() {
    const options = Util.createRequestOptions(`${this.conf.serverUrl}/go/api/dashboard`, this.conf, true, {'Accept' : 'application/vnd.go.cd.v3+json'});

    return rp(options)
      .then((res) => {
        // Return map with pipeline name as key.
        return res._embedded.pipeline_groups.reduce((acc, curr) => {
          curr._embedded.pipelines.forEach((cp) => {
            acc[cp.name] = cp.pause_info;
          });
          return acc;
        }, {});
      })
      .catch((err) => {
        Logger.error('Failed to retrieve pipeline pause information');
        return {};
      })
  }

  /**
   * @param   {string}          name  Name of the pipeline
   * @returns {Promise<Object>}       Pipeline instance. 
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
   *        status: 'passed',
   *        jobresults: [{
   *          name: 'build-job',
   *          result: 'passed',
   *          schedueld: 1457085089646
   *        }]
   *      },
   *      {
   *        name: 'Test',
   *        status: 'building'
   *        jobresults: []
   *      }] 
   * }
   */
  getPipelineHistory(name) {
    const options = Util.createRequestOptions(`${this.conf.serverUrl}/go/api/pipelines/${name}/history`, this.conf, true, {'Accept' : 'application/vnd.go.cd.v1+json'});
    return rp(options)
      .then(res => GoPipelineParser.parsePipelineResult(res.pipelines.slice(0, 5)))
      .catch((err) => {
        Logger.error(`Failed to get pipeline history for pipeline "${name}" returning last result, ${err.statusCode}: ${err.message}`);
        return this.pipelines ? this.pipelines.filter((p) => p && p.name === name)[0] : null;
      });
  }

}
