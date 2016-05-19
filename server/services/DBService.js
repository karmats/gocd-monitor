import Datastore from 'nedb';

// Singleton class
let instance;

export default class DBService {

  constructor() {
    if (!instance) {
      this.datastore = new Datastore({ filename: 'server/data.db', autoload: true });
      instance = this;
    }

    return instance;
  }

  /**
   * @return {Promise<Object>}  Settings stored in db
   */
  getSettings() {
    return new Promise((resolve, reject) => {
      return this._getDocument().then((doc) => {
        if (doc.settings) {
          resolve(doc.settings);
        } else {
          reject(new Error('Failed to find settings'));
        }
      })
    });
  }

  /**
   * @param {Object}          settings   The new settings to save or update
   * @return {Promise<Object>}           The updated settings
   */
  saveOrUpdateSettings(settings) {
    return new Promise((resolve, reject) => {
      return this._getDocument().then((doc) => {
        if (doc.settings) {
          this.datastore.update({ _id: doc._id }, { $set: { settings: settings } }, {}, (updErr) => {
            if (!updErr) {
              // Compact so file so only one settings object is saved
              this.datastore.persistence.compactDatafile();
              resolve(settings);
            } else {
              reject(updErr);
            }
          })
        } else {
          this.datastore.insert({ settings: settings }, (insErr) => {
            if (!insErr) {
              resolve(settings);
            } else {
              reject(insErr);
            }
          });
        }
      });
    });
  }

  /**
   * @return {Promise<Object>} A history of test results
   */
  getTestResults() {
    return new Promise((resolve, reject) => {
      return this._getDocument().then((doc) => {
        if (doc.tests) {
          resolve(doc.tests);
        } else {
          reject(new Error('Failed to find test results'));
        }
      })
    });
  }

  /**
   * @param {Object}          testResult   The new test results to save or update
   * @return {Promise<Object>}             The updated test results
   */
  saveOrUpdateTestResult(testResult) {
    return new Promise((resolve, reject) => {
      return this._getDocument().then((doc) => {
        if (doc.tests) {
          this.datastore.update({ _id: doc._id }, { $set: { tests: testResult } }, {}, (updErr) => {
            if (!updErr) {
              // Compact so file so only one settings object is saved
              this.datastore.persistence.compactDatafile();
              resolve(testResult);
            } else {
              reject(updErr);
            }
          })
        } else {
          this.datastore.insert({ tests: testResult }, (insErr) => {
            if (!insErr) {
              resolve(testResult);
            } else {
              reject(insErr);
            }
          });
        }
      });
    });
  }

  /**
   * @return {Promise<Object>} The database document
   */
  _getDocument() {
    return new Promise((resolve, reject) => {
      this.datastore.findOne({}, (err, doc) => {
        if (doc && !err) {
          resolve(doc);
        } else if (err) {
          reject(err);
        } else {
          reject(new Error('Failed to find datastore'));
        }
      });
    });
  }
}