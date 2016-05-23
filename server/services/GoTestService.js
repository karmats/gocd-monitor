import rp from 'request-promise';

import Logger from '../utils/Logger';
import CucumberJsonParser from '../utils/CucumberJsonParser';

export default class GoTestService {

  constructor(goConfig) {
    this.conf = goConfig;
  }

  /**
   * Get test reports from a file uri. The uri points to a pipeline/stage/job artifact exposures.
   * 
   * @param  {string}           uri   The uri to get test reports from
   * @return {Promise<Object>}  Array with test reports, for now only cucumber tests are supported
   */
  getTestsFromUri(uri) {

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
      let fileUris = this._retrieveJsonFiles({
        name: 'root',
        type: 'folder',
        files: files
      });

      let promises = [];
      // Retrieve test files
      fileUris.forEach((fileUri) => {
        options.uri = fileUri;
        promises.push(rp(options).then((testReport) => {
          // Parse file to and retrieve most relevant info
          let testResult = CucumberJsonParser.parse(testReport);
          if (testResult) {
            // Add as new test
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
