import * as conf from '../../app-config';

import GoPipelineService from './GoPipelineService';
import GoTestService from './GoTestService';
import DBService from './DBService';
import Logger from '../utils/Logger';

export default class GoService {

  constructor() {
    this.goConfig = new GoConfig(conf.goServerUrl, conf.goUser, conf.goPassword);
    this.clients = [];
    this.pipelines = [];
    this.pipelineNames = [];
    this.testResults = [];
    this.currentSettings = {
      disabledPipelines: []
    };
    this.pollingInterval = conf.goPollingInterval * 1000;
    // Refresh pipelines once every day
    this.checkPipelinesInterval = 24 * 60 * 60 * 1000;
    this.pipelineService = new GoPipelineService(this.goConfig);
    this.testService = new GoTestService(this.goConfig);

    // Init db and settings
    this.dbService = new DBService();

  }

  /**
   * Starts the service. Polls go server for pipeline and test results
   */
  start() {
    // Retrieve current settings
    this.dbService.getSettings().then((doc) => {
      this.currentSettings = doc.settings;
    });

    // Retrieve stored test results
    this.dbService.getTestResults().then((testResults) => {
      this.testResults = testResults;
    });

    // Start polling go server for build and test results
    this.pollGoServer();
  }

  pollGoServer() {
    // Function that refreshes all pipelines
    let refreshPipelines = (pipelineNames) => {
      let currentPipelines = [];
      const pipelinesToIgnore = this.currentSettings.disabledPipelines;
      const pipelinesToFetch = pipelineNames.filter(p => pipelinesToIgnore.indexOf(p) < 0);
      pipelinesToFetch.forEach((name) => {
        this.pipelineService.getPipelineHistory(name).then((pipeline) => {
          currentPipelines.push(pipeline);
          if (currentPipelines.length === pipelinesToFetch.length) {
            this.pipelines = currentPipelines;
            Logger.debug(`Emitting ${currentPipelines.length} pipelines to ${this.clients.length} clients`);
            this.notifyAllClients('pipelines:updated', currentPipelines);
          }
        });
      });
    };

    let pollId;
    let refreshPipelinesAndPollForUpdates = () => {
      Logger.info('Retrieving pipeline names');
      // Cancel current poll and start over
      if (pollId) {
        clearInterval(pollId);
      }
      // Fetch the pipelines and start polling pipeline history
      this.pipelineService.getAllPipelines()
        .then((pipelineNames) => {
          this.pipelineNames = pipelineNames;
          this.notifyAllClients('pipelines:names', pipelineNames);
          refreshPipelines(pipelineNames);
          pollId = setInterval(refreshPipelines, this.pollingInterval, pipelineNames);
        })
        .catch((err) => {
          Logger.error('Failed to retrieve pipeline names, retrying');
          Logger.error(err);
          // Wait a second before trying again
          setTimeout(refreshPipelinesAndPollForUpdates, 1000);
        });
    };
    // Refresh pipeline names and poll every day for new
    refreshPipelinesAndPollForUpdates();
    setInterval(refreshPipelinesAndPollForUpdates, this.checkPipelinesInterval);

  }

  /**
   * Adds tests from a pipeline. Retrieves all test report files and saves it to db
   * 
   * @param {Object} pipeline The pipeline to get the test reports from
   */
  addPipelineTests(pipeline) {
    this.testService.getTestsFromPipeline(pipeline).then((result) => {
      // Flatten the array
      let reports = result.reduce((p, c) => {
        return p.concat(c);
      }, []);
    })
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
        this.addPipelineTests(testPipeline);
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

/**
 * Class to hold go config
 */
export class GoConfig {

  constructor(serverUrl, user, password) {
    this.serverUrl = serverUrl;
    this.user = user;
    this.password = password;
  }
}
