import rp from 'request-promise';

import Logger from '../utils/Logger';
import CucumberJsonParser from '../utils/CucumberJsonParser';

export default class GoTestService {

  constructor(goConfig) {
    this.conf = goConfig;
  }

  /**
   * Get all test reports from a pipeline
   * 
   * @param  {string}   name  Name of the pipeline to get the test reports from
   * @return {Promise}  Array with test reports, for now only cucumber tests are supported
   */
  getTestsFromPipeline(name) {
    Logger.info(`Scanning ${name} for test files`);

    // Get test reports from 10 latest pipelines
    let options = {
      uri: `${this.conf.serverUrl}/go/api/pipelines/${name}/history/0`,
      rejectUnauthorized: false,
      json: true,
      auth: {
        user: this.conf.user,
        pass: this.conf.password
      }
    };

    return rp(options).then((pipelineHistory) => {
      let promises = [];
      pipelineHistory.pipelines.forEach((pipeline) => {
        pipeline.stages.forEach((stage) => {
          stage.jobs.forEach((job) => {
            promises = promises.concat(this._getTestsFromUri(`${this.conf.serverUrl}/go/files/${pipeline.name}/${pipeline.counter}/${stage.name}/${stage.counter}/${job.name}.json`));
          });
        });
      });
      return Promise.all(promises);
    });
  }
  /**
   * Get test reports from a file uri. The uri points to a pipeline/stage/job artifact exposures.
   * 
   * @param  {string}           uri   The uri to get test reports from
   * @return {Promise<Array>}  Array with test reports, for now only cucumber tests are supported
   */
  _getTestsFromUri(uri) {

    let options = {
      uri: uri,
      rejectUnauthorized: false,
      json: true,
      auth: {
        user: this.conf.user,
        pass: this.conf.password
      }
    };

    return rp(options).then((files) => {
      let fileUris = this._retrieveTestReportFiles({
        name: 'root',
        type: 'folder',
        files: files
      });

      let promises = [];
      // Retrieve test files
      fileUris.forEach((fileUri) => {
        options.uri = fileUri;
        promises.push(rp(options).then((testReport) => {
          // Parse file and retrieve most relevant info, only cucumber supported atm
          let testResult = CucumberJsonParser.parse(testReport);
          if (testResult) {
            testResult.type = 'cucumber';
            return testResult;
          }

        }));

      });
      return Promise.all(promises);
    }).catch((err) => {
      return err;
    });
  }

  // Recursive method that walks through a go file json structure and retrives all json files
  _retrieveTestReportFiles(root) {
    const traverseFile = (file, jsonFiles) => {
      if (file.type === 'file' && file.name.indexOf('.json') > 0) {
        jsonFiles.push(file.url);
      }
      else if (file.files) {
        for (let i = 0; i < file.files.length; i++) {
          traverseFile(file.files[i], jsonFiles);
        }
      }
      return jsonFiles;
    }
    return traverseFile(root, []);
  }

}
