import * as conf from '../../app-config';

import GoBuildService from './GoBuildService';
import GoTestService from './GoTestService';
import DBService from './DBService';
import Logger from '../utils/Logger';
import CucumberParser from '../utils/CucumberParser';

export default class GoService {

  constructor() {
    this.goConfig = new GoConfig(conf.goServerUrl, conf.goUser, conf.goPassword);
    this.clients = [];
    this.pipelines = [];
    this.pipelineNames = [];
    this.pipelinesPauseInfo = {};
    this.testResults = [];
    this.currentSettings = {
      disabledPipelines: []
    };
    this.pollingInterval = conf.goPollingInterval * 1000;
    // Refresh pipelines once every day
    this.checkPipelinesInterval = 24 * 60 * 60 * 1000;
    this.buildService = new GoBuildService(this.goConfig);
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
      if (doc && doc.settings) {
        this.currentSettings = doc.settings;
      }
    });

    // Retrieve stored test results
    this._refreshAndNotifyTestResults();

    // Start polling go server for build and test results
    this.pollGoServer();
  }

  pollGoServer() {
    // Function that refreshes all pipelines
    const refreshPipelines = (pipelineNames) => {
      let currentPipelines = [];
      const pipelinesToIgnore = this.currentSettings.disabledPipelines;
      const pipelinesToFetch = pipelineNames.filter(p => pipelinesToIgnore.indexOf(p) < 0);
      pipelinesToFetch.forEach((name) => {
        this.buildService.getPipelineHistory(name).then((pipeline) => {
          // Add pause information
          if (this.pipelinesPauseInfo[name]) {
            pipeline.pauseinfo = this.pipelinesPauseInfo[name];
          }
          currentPipelines.push(pipeline);
          if (currentPipelines.length === pipelinesToFetch.length) {
            this.pipelines = currentPipelines;
            // Update tests if needed
            this.updateTestResults(currentPipelines);
            Logger.debug(`Emitting ${currentPipelines.length} pipelines to ${this.clients.length} clients`);
            this.notifyAllClients('pipelines:updated', currentPipelines);
          }
        });
      });
    };

    let pollId;
    const refreshPipelinesAndPollForUpdates = () => {
      Logger.info('Retrieving pipeline names');
      // Cancel current poll and start over
      if (pollId) {
        clearInterval(pollId);
      }
      // Fetch the pipelines with pause info and start polling pipeline history
      this.buildService.getAllPipelines()
        .then((pipelineNames) => {
          this.pipelineNames = pipelineNames;
          this.notifyAllClients('pipelines:names', pipelineNames);
          this.buildService.getPipelinesPauseInfo().then((pauseInfo) => {
            this.pipelinesPauseInfo = pauseInfo;
            refreshPipelines(pipelineNames);
            pollId = setInterval(refreshPipelines, this.pollingInterval, pipelineNames);
          });
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
   * @param {string} pipeline The pipeline to get the test reports from
   */
  addPipelineTests(pipeline) {
    Logger.debug(`Adding test results from '${pipeline}'`);
    this.testService.getTestsFromPipeline(pipeline).then((result) => {
      // Group tests with same id
      const reports = result.reduce((acc, c) => {
        if (c && c.cucumber.length > 0) {
          const existing = acc.filter(ex => ex._id === c._id)[0];
          if (existing) {
            existing.cucumber = existing.cucumber.concat(c.cucumber);
          } else {
            acc.push(c);
          }
        }
        return acc;
      }, []);
      // Save to db
      reports.forEach((report) => {
        this.dbService.saveTestResult(report).then((savedReports) => {
          this._refreshAndNotifyTestResults();
          this.notifyAllClients('tests:message', 'Tests added');
        }, () => {
          const msg = 'Failed to save test result';
          Logger.error(msg);
          this.notifyAllClients('tests:message', msg);
        });
      })
    })
  }

  /**
   * Update test results if needed
   * 
   * @param {Array<Object>}   pipelines   Pipelines to check for new tests
   */
  updateTestResults(pipelines) {
    const testsToUpdate = [];

    // Check all test results. If timestamp for a job is after latest test report timestamp
    // the test will be updated
    this.testResults.forEach((result) => {
      // Time when last test was runned
      const latestTestTime = result.cucumber ? result.cucumber.reduce((p, cTest) => {
        if (cTest.timestamp > p) {
          return cTest.timestamp;
        }
        return p;
      }, 0) : 0;
      const testPipeline = pipelines
        .reduce((p, cPipeline) => {
          if (cPipeline && cPipeline.name === result.pipeline) {
            for (let i = 0; i < cPipeline.stageresults.length; i++) {
              const stage = cPipeline.stageresults[i];
              // If stage is building, test report isn't ready yet
              if (stage.name === result.stage && stage.status !== 'building') {
                for (let j = 0; j < stage.jobresults.length; j++) {
                  const job = stage.jobresults[j];
                  // If scheduled job time is after time of latest test 
                  if (job.name === result.job && job.scheduled > latestTestTime) {
                    return {
                      testId: result._id,
                      pipeline: cPipeline.name,
                      pipelineCounter: cPipeline.counter,
                      stage: stage.name,
                      stageCounter: stage.counter,
                      job: job.name,
                      scheduled: job.scheduled
                    }
                  }
                }
              }
            }
          }
          return p;
        }, null);

      // Add as test to update
      if (testPipeline) {
        testsToUpdate.push(testPipeline);
      }
    });

    // Retrive latest test report files
    testsToUpdate.forEach((p) => {
      this.testService.getTestsFromUri(
        `${this.goConfig.serverUrl}/go/files/${p.pipeline}/${p.pipelineCounter}/${p.stage}/${p.stageCounter}/${p.job}.json`)
        .then((res) => {
          if (res && res.length > 0) {
            const cucumber = CucumberParser.cucumberResultToDbObject(res, p.scheduled);
            if (cucumber) {
              // Save to db and notify all clients
              this.dbService.updateTestResult(p.testId, 'cucumber', cucumber).then(() => {
                this._refreshAndNotifyTestResults();
              }, () => {
                const msg = `Failed to save tests for id ${p.testId}`;
                Logger.error(msg);
                this.notifyAllClients('tests:message', msg);
              })
            }
          }
        });
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
        }, () => {
          Logger.error('Failed to save settings');
        });
      });

      client.on('tests:add', (testPipeline) => {
        this.addPipelineTests(testPipeline);
      });
      client.on('tests:remove', (testId) => {
        this.dbService.removeTestResult(testId).then(() => {
          this._refreshAndNotifyTestResults();
          this.notifyAllClients('tests:message', 'Test removed');
        }, () => {
          const msg = 'Failed to remove test result';
          Logger.error(msg);
          this.notifyAllClients('tests:message', msg);
        });
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

  // Get latest test results from db and notify all clients
  _refreshAndNotifyTestResults() {
    this.dbService.getTestResults().then((results) => {
      this.testResults = results;
      this.notifyAllClients('tests:updated', this.testResults);
    }, () => {
      const msg = 'Failed to get test results from db';
      this.notifyAllClients('tests:message', msg);
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
