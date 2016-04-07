import Datastore from 'nedb';

import Logger from '../utils/Logger';

export default class Service {

  constructor() {
    this.clients = [];
    this.pipelines = [];
    // Init db and settings
    this.datastore = new Datastore({ filename: 'server/data.db', autoload: true });
    this.datastore.findOne({}, (err, doc) => {
      if (doc && doc.settings) {
        this.currentSettings = doc.settings;
      }
    });
  }

  /**
   * Register new client listener
   * 
   * @param {Socket}  client  Socket client that will receive automatic updates
   */
  registerClient(client) {
    // Add client if not in clients list
    if (!this.clients.some(c => client.id === c.id)) {

      // Emit latest pipelines and settings
      client.emit('pipelines:updated', this.pipelines);
      client.emit('settings:updated', this.currentSettings);

      // Register for setting updates
      client.on('settings:update', (settings) => {
        this.datastore.findOne({}, (err, doc) => {
          if (doc && doc.settings) {
            this.datastore.update({ _id: doc._id }, { $set : { settings : settings  } }, {}, (err) => {
              Logger.debug('Settings updated');
              // Compact so file so only one settings object is saved
              this.datastore.persistence.compactDatafile();
              this.currentSettings = settings;
            })
          } else {
            this.datastore.insert({ settings: settings}, (err) => {
              Logger.debug('Settings saved');
            });
          }
        });

        // Notify other clients about the update
        this.clients.forEach((client) => {
          client.emit('settings:updated', settings);
        });
      });

      this.clients.push(client);
    }
  }

  /**
   * Unregister client listener
   * 
   * @param {Socket}  client  Socket client that will no longer receive updates
   */
  unregisterClient(client) {
    this.clients = this.clients.filter(c => client.id !== c.id);
  }

}
