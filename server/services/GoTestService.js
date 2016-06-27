import rp from 'request-promise';

import Logger from '../utils/Logger';
import Util from '../utils/Util';
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
    // Get test reports from 10 latest pipelines
    const options = Util.createRequestOptions(`${this.conf.serverUrl}/go/api/pipelines/${name}/history/0`, this.conf, true);

    return rp(options).then((pipelineHistory) => {
      let promises = [];
      pipelineHistory.pipelines.forEach((pipeline) => {
        pipeline.stages.forEach((stage) => {
          stage.jobs.forEach((job) => {
            promises = promises.concat(
              this.getTestsFromUri(`${this.conf.serverUrl}/go/files/${pipeline.name}/${pipeline.counter}/${stage.name}/${stage.counter}/${job.name}.json`)
                .then((result) => {
                  if (result && result.length > 0) {
                    const cucumberResult = result.filter(res => res.type === 'cucumber');
                    if (cucumberResult.length > 0) {
                      // Concatenate the features from all cucumber tests
                      const cucumber = cucumberResult.reduce((acc, c) => {
                        acc.features = acc.features.concat(c.features);
                        return acc;
                      }, { features: [] });

                      // Test time 
                      cucumber.timestamp = job.scheduled_date;

                      return {
                        _id: `${pipeline.name}-${stage.name}-${job.name}`.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '_'),
                        pipeline: pipeline.name,
                        stage: stage.name,
                        job: job.name,
                        cucumber: [cucumber]
                      }

                    }
                  }
                })
            );
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
  getTestsFromUri(uri) {
    const options = Util.createRequestOptions(uri, this.conf, true);

    return rp(options).then((files) => {
      const fileUris = this._retrieveTestReportFiles({
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
          const testResult = CucumberJsonParser.parse(testReport);
          if (testResult) {
            testResult.type = 'cucumber';
            return testResult;
          }

        }, () => {
          Logger.error('Failed to get cucumber test report');
          return null;
        }));

      });
      return Promise.all(promises);
    }).catch((err) => {
      return Promise.resolve();
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
