import Datastore from 'nedb';

// Singleton class
let instance;

export default class DBService {

  constructor() {
    if (!instance) {
      instance = this;
    }
    this.datastore = new Datastore({ filename: 'server/data.db', autoload: true });

    return instance;
  }

  /**
   * @return {Promise<Object>}  Settings stored in db
   */
  getSettings() {
    return new Promise((resolve, reject) => {
      return this.getDocument().then((doc) => {
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
      return this.getDocument().then((doc) => {
        if (settings) {
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
      return this.getDocument().then((doc) => {
        if (doc.tests) {
          resolve(doc.tests);
        } else {
          reject(new Error('Failed to find test results'));
        }
      })
    });
  }

  /**
   * @return {Promise<Object>} The database document
   */
  getDocument() {
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