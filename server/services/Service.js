import DBService from './DBService';
import Logger from '../utils/Logger';

export default class Service {

  constructor() {
    this.clients = [];
    this.pipelines = [];
    this.pipelineNames = [];
    this.testResults = {};

    // Init db and settings
    this.dbService = new DBService();
    this.dbService.getSettings().then((doc) => {
      this.currentSettings = doc.settings;
    }, (error) => {
      this.currentSettings = {
        disabledPipelines : []
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

      // Emit latest pipeline names and settings
      client.emit('pipelines:names', this.pipelineNames);
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

      client.on('tests:add', (testPipeline) => {
        if (this.addPipelineForTest) {
          this.addPipelineForTest(testPipeline);
        }
      });

      // Return pipelines and tests if client asks for it
      client.on('pipelines:get', () => {
        client.emit('pipelines:updated', this.pipelines);
      });
      client.on('tests:get', () => {
        client.emit('tests:updated', this.testResults);
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
