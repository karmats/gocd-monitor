import Datastore from 'nedb';

export default class DBService {

  constructor() {
    this.datastore = new Datastore({ filename: 'server/data.db', autoload: true });
  }

  /**
   * @return {Promise<Object>}  Settings stored in db
   */
  getSettings() {
    return this._executeDbAction('findOne', { settings: { $exists: true } });
  }

  /**
   * @param {Object}          settings   The new settings to save or update
   * @return {Promise<Object>}           The updated settings
   */
  saveOrUpdateSettings(settings) {
    const insertSettings = () => {
      return this._executeDbAction('insert', { settings: settings })
    }
    return this.getSettings().then((doc) => {
      if (doc && doc.settings) {
        return this._executeDbAction('update', { _id: doc._id }, { $set: { settings: settings } }, {}).then(() => {
          // Since callback of an update returns number of affected documents, we resolve with settings argument 
          return settings;
        });
      } else {
        return insertSettings();
      }
    }, () => {
      return insertSettings();
    });
  }

  /**
   * @return {Promise<Object>} A history of test results
   */
  getTestResults() {
    return this._executeDbAction('find', { type: 'test' });
  }

  /**
   * @param {Object}          testResult   The new test result to save
   * @return {Promise<Object>}             The saved test result
   */
  saveTestResult(testResult) {
    // Remove if any
    return this.removeTestResult(testResult._id).then(() => {
      testResult.type = 'test';
      return this._executeDbAction('insert', testResult);
    });
  }

  /**
   * @param {string}  testResultId  Id of the test to remove
   */
  removeTestResult(testResultId) {
    return this._executeDbAction('remove', { _id: testResultId }, {});
  }

  /**
   * @param {string}          testName     Name/id of the test
   * @param {string}          testType     Type of test, i.e. cucumber
   * @param {Object}          testResult   The test result to update
   * @return {Promise<Object>}             The updated test result
   */
  updateTestResult(testName, testType, testResult) {
    const testToSave = {};
    testToSave[testType] = testResult;
    return this._executeDbAction('update', { _id: testName }, { $push: testToSave }, {});
  }

  /**
   * Executes a database action
   * 
   * @param   {string}        action    The action to execute e.g. find, update, remove etc
   * @parma   {Array<Object>} args      Database arguments
   */
  _executeDbAction(action, ...args) {
    return new Promise((resolve, reject) => {
      this.datastore[action](...args, (error, success) => {
        if (error) {
          reject(error);
        } else {
          // Compress db file when on save actions
          if (action === 'insert' || action === 'update') {
            this.datastore.persistence.compactDatafile();
          }
          resolve(success);
        }
      })
    })
  }
}
