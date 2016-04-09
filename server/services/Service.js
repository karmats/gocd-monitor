import Datastore from 'nedb';

import Logger from '../utils/Logger';

export default class Service {

  constructor() {
    this.clients = [];
    this.pipelines = [];
    this.pipelineNames = [];
    // Init db and settings
    this.datastore = new Datastore({ filename: 'server/data.db', autoload: true });
    this.datastore.findOne({}, (err, doc) => {
      if (doc && doc.settings && !err) {
        this.currentSettings = doc.settings;
      } else {
        this.currentSettings = {
          disabledPipelines: []
        }
        if (err) {
          Logger.error('Failed to load datastore');
        }
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

      // Emit latest pipelines, pipeline names and settings
      client.emit('pipelines:names', this.pipelineNames);
      client.emit('pipelines:updated', this.pipelines);
      client.emit('settings:updated', this.currentSettings);

      // Register for setting updates
      client.on('settings:update', (settings) => {
        this.datastore.findOne({}, (err, doc) => {
          if (doc && doc.settings) {
            this.datastore.update({ _id: doc._id }, { $set : { settings : settings  } }, {}, (updErr) => {
              if (!updErr) {
                Logger.debug('Settings updated');
                // Compact so file so only one settings object is saved
                this.datastore.persistence.compactDatafile();
              } else {
                Logger.error('Failed to update settings');
              }
            })
          } else if (!err) {
            this.datastore.insert({ settings: settings}, (insErr) => {
              if (!insErr) {
                Logger.debug('Settings saved');
              } else {
                Logger.error('Failed to save settings');
              }
            });
          } else {
            Logger.error('Failed to find settings');
          }
        });
        this.currentSettings = settings;

        // Notify other clients about the update
        this.notifyAllClients('settings:updated', settings);
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

  /**
   * Emits an event to all registered clients
   * 
   * @param {string}  event   Name of the event
   * @param {Object}  data    The data to send
   */
  notifyAllClients(event, data) {
    this.clients.forEach((client) => {
      client.emit(event, data);
    });
  }
}
