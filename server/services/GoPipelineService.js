import rp from 'request-promise';

import Logger from '../utils/Logger';
import GoPipelineParser from '../utils/GoPipelineParser';
import { GoConfig } from './GoService';

export default class GoPipelineService {

  constructor(goConfig) {
    this.conf = goConfig;
  }

  /**
   * Start polling go server for pipeline results
   */
  startPolling() {

  }

  /**
   * @returns {Promise<Array<string>>} All available pipelines from the go.cd server
   */
  getAllPipelines() {
    let options = {
      uri: this.conf.serverUrl + '/go/api/pipelines.xml',
      rejectUnauthorized: false,
      auth: {
        user: this.conf.user,
        pass: this.conf.password
      }
    };
    return rp(options)
      .then((res) => {
        // Parse response xml
        return GoPipelineParser.parsePipelineNames(res).then((pipelineNames) => {
          return pipelineNames;
        }, (error) => {
          Logger.error('Failed to parse pipelines.xml, shutting down');
          throw error;
        });
      }).catch((err) => {
        Logger.error('Failed to retrieve pipeline names, shutting down');
        throw err
      });
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
   *        status: 'passed'
   *      },
   *      {
   *        name: 'Test',
   *        status: 'building'
   *      }] 
   * }
   */
  getPipelineHistory(name) {
    let options = {
      uri: this.conf.serverUrl + '/go/api/pipelines/' + name + '/history/0',
      json: true,
      rejectUnauthorized: false,
      auth: {
        user: this.conf.user,
        pass: this.conf.password
      }
    };
    return rp(options)
      .then(res => GoPipelineParser.parsePipelineResult(res.pipelines.slice(0, 5)))
      .catch((err) => {
        Logger.error(`Failed to get pipeline history for pipeline "${name}" returning last result, ${err.statusCode}: ${err.message}`);
        return this.pipelines.filter((p) => p && p.name === name)[0];
      });
  }

}
