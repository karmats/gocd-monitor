import rp from 'request-promise';

import Logger from '../utils/Logger';
import CucumberJsonParser from '../utils/CucumberJsonParser';
import * as conf from '../../app-config';
import Service from './Service';

export default class GoTestService extends Service {

  constructor() {
    super();
    this.baseUrl = conf.goServerUrl + '/go/files';
    this.user = conf.goUser;
    this.password = conf.goPassword;
  }

  start() {
    this.dbService.getTestResults().then(
    (testResults) => {
      this.testResults = testResults;
    },
    (error) => {
      Logger.error('Failed to get test results');
    });
  }

  addPipelineForTest(testPipeline) {
    Logger.info('Adding ' + testPipeline.name + ' to test stream');
    // Scan all pipeline jobs for cucumber json files, if found add to db
    let pipelineUri = this.baseUrl + `/${testPipeline.name}/${testPipeline.counter - 1}`;
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

        //options.uri = `${pipelineUri}/${stage.name}/${stage.counter}/${job.name}.json`;
        options.uri = 'https://go.seal-software.net/go/files/scx-systemtest-master/88/GUI/2/scd-gui.json';
        Logger.debug('Retrieving test files from ' + options.uri);
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
              const testResult = CucumberJsonParser.parse(testReport);
              this.testResults[`${testPipeline.name}-${stage.name}-${job.name}`] = testResult;
              this.dbService.saveOrUpdateTestResult(this.testResults);
              this.notifyAllClients('tests:updated', this.testResults);
            }).catch((error) => {
              console.log(error);
              Logger.error('Failed to get test report');
            })
          });
        }).catch((err) => {
          Logger.error('Failed to get stage history', err);
        });
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
