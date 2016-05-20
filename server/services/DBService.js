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
        $or: [
          { 'settings.sortOrder': 'status' },
          { 'settings.sortOrder': 'buildtime' }]
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
   * @param {Object}          testResult   The new test results to save or update
   * @return {Promise<Object>}             The updated test results
   */
  saveOrUpdateTestResult(testName, testResult) {
    return new Promise((resolve, reject) => {
      return this.datastore.findOne({ _id: testName }, (err, doc) => {
        if (!err && doc) {
          this.datastore.update({ _id: testName }, { $push: { results: testResult } }, {}, (updErr, updatedTests) => {
            if (!updErr) {
              // Compact so file so only one test report object is saved
              this.datastore.persistence.compactDatafile();
              resolve(testResult);
            } else {
              reject(updErr);
            }
          });
        } else {
          this.datastore.insert({ _id: testName, type: 'tests', results: [testResult] }, (insErr, savedTest) => {
            if (!insErr) {
              resolve(savedTest);
            } else {
              reject(insErr);
            }
          });
        }
      })
    });
  }
}
