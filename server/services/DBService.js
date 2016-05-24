import Datastore from 'nedb';

export default class DBService {

  constructor() {
    this.datastore = new Datastore({ filename: 'server/data.db', autoload: true });
  }

  /**
   * @return {Promise<Object>}  Settings stored in db
   */
  getSettings() {
    return new Promise((resolve, reject) => {
      return this.datastore.findOne({
        settings: { $exists: true }
      }, (err, doc) => {
        if (doc && !err) {
          resolve(doc);
        } else {
          reject(err || new Error('Failed to find settings'));
        }
      });
    });
  }

  /**
   * @param {Object}          settings   The new settings to save or update
   * @return {Promise<Object>}           The updated settings
   */
  saveOrUpdateSettings(settings) {
    return new Promise((resolve, reject) => {
      const insertSettings = () => {
        this.datastore.insert({ settings: settings }, (insErr) => {
          if (!insErr) {
            this.datastore.persistence.compactDatafile();
            resolve(settings);
          } else {
            reject(insErr);
          }
        });
      }
      return this.getSettings().then((doc) => {
        if (doc.settings) {
          this.datastore.update({ _id: doc._id }, { $set: { settings: settings } }, {}, (updErr) => {
            if (!updErr) {
              // Compact file so only one settings object is saved
              this.datastore.persistence.compactDatafile();
              resolve(settings);
            } else {
              reject(updErr);
            }
          })
        } else {
          insertSettings();
        }
      }, () => {
        insertSettings();
      });
    });
  }

  /**
   * @return {Promise<Object>} A history of test results
   */
  getTestResults() {
    return new Promise((resolve, reject) => {
      return this.datastore.find({ type: 'tests' }, (err, doc) => {
        if (doc && !err) {
          resolve(doc);
        } else {
          reject(err || new Error('Failed to find tests'));
        }
      });
    });
  }

  /**
   * @param {string}          testName     Name/id of the test
   * @param {string}          testType     Type of test, i.e. cucumber
   * @param {Object}          pipelineInfo pipeline/stage/job names
   * @param {Object}          testResult   The new test result to save
   * @return {Promise<Object>}             The saved test result
   */
  saveTestResult(testName, testType, pipelineInfo, testResult) {
    return new Promise((resolve, reject) => {
      let testToSave = {
        _id : testName,
        type: 'test',
        pipeline: pipelineInfo.pipeline,
        stage: pipelineInfo.stage,
        job: pipelineInfo.job
      };
      testToSave[testType] = [testResult];
      this.datastore.insert(testToSave, (insErr, savedTest) => {
        if (!insErr) {
          resolve(savedTest);
        } else {
          reject(insErr);
        }
      });
    });
  }

  /**
   * @param {string}          testName     Name/id of the test
   * @param {string}          testType     Type of test, i.e. cucumber
   * @param {Object}          testResult   The test result to update
   * @return {Promise<Object>}             The updated test result
   */
  updateTestResult(testName, testType, testResult) {
    return new Promise((resolve, reject) => {
      let testToSave = {};
      testToSave[testType] = testResult;
      this.datastore.update({ _id: testName }, { $push: testToSave }, {}, (updErr) => {
        if (!updErr) {
          // Compact file so only one test report object is saved
          this.datastore.persistence.compactDatafile();
          resolve(testResult);
        } else {
          reject(updErr);
        }
      });
    });
  }
}
