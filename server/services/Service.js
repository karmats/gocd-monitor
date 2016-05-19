import DBService from './DBService';
import Logger from '../utils/Logger';

export default class Service {

  constructor() {
    this.clients = [];
    this.pipelines = [];
    this.pipelineNames = [];

    // Init db and settings
    this.dbService = new DBService();
    this.dbService.getSettings().then((settings) => {
      this.currentSettings = settings;
    }, (error) => {
      this.currentSettings = {
        disabledPipelines : []
      }
      Logger.error('Failed to load settings');
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
        this.dbService.saveOrUpdateSettings(settings).then((savedSettings) => {
          this.currentSettings = savedSettings;
          // Notify other clients about the update
          this.notifyAllClients('settings:updated', savedSettings);
        }, (error) => {
          Logger.error('Failed to save settings');
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
