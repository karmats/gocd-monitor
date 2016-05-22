import rp from 'request-promise';

import Logger from '../utils/Logger';
import CucumberJsonParser from '../utils/CucumberJsonParser';

export default class GoTestService {

  constructor(goConfig) {
    this.conf  = goConfig;
  }

  addPipelineForTest(testPipeline) {
    Logger.info('Adding ' + testPipeline.name + ' to test stream');
    // Scan all pipeline jobs for cucumber json files, if found add to db
    let pipelineUri = this.conf.serverUrl + `/go/files/${testPipeline.name}/${testPipeline.counter}`;
    let options = {
      rejectUnauthorized: false,
      json: true,
      auth: {
        user: this.user,
        pass: this.password
      }
    };
    testPipeline.stageresults.forEach((stage) => {
      // Check all files for json files
      stage.jobresults.forEach((job) => {
        const testName = `${testPipeline.name}-${stage.name}-${job.name}`.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '_');

        // Don't add if test already exists
        if (!this.testResults[testName]) {
          options.uri = `${pipelineUri}/${stage.name}/${stage.counter}/${job.name}.json`;
          Logger.debug(`Retrieving files from ${options.uri}`);

          rp(options).then((files) => {
            let urls = this._retrieveJsonFiles({
              name: 'root',
              type: 'folder',
              files: files
            });
            Logger.debug(`Found ${urls.length} test files`);

            // Retrieve test files
            urls.forEach((url) => {
              options.uri = url;
              rp(options).then((testReport) => {
                Logger.debug('Goet test report');
                // Parse file to and retrieve most relevant info
                let testResult = CucumberJsonParser.parse(testReport);
                if (testResult) {
                  testResult.timestamp = Date.now();
                  // Who to blame if anything went wrong
                  testResult.blame = testPipeline.author;

                  // Add as new test
                  this.testResults[testName] = [testResult];

                  // Save to db
                  this.dbService.saveOrUpdateTestResult(testName, testResult).then((savedTests) => {
                    Logger.debug('Saved success');
                    this.notifyAllClients('tests:updated', savedTests);
                  }, (error) => {
                    Logger.error('Failed ot save test result');
                  });
                }

              }).catch((error) => {
                Logger.error('Failed to get test report');
              })

            });
          }).catch((err) => {
            Logger.error('Failed to get stage history', err);
          });
        }
      });
    });
  }

  _retrieveJsonFiles(root) {
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
