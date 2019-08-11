import * as conf from '../../app-config';

import GoBuildService from './GoBuildService';
import GoTestService from './GoTestService';
import DBService from './DBService';
import Logger from '../utils/Logger';
import CucumberParser from '../utils/CucumberParser';
import Datastore from 'nedb';

export default class GoService {

  constructor() {
    this.goConfig = new GoConfig(conf.goServerUrl, conf.goUser, conf.goPassword);
    this.clients = [];
    this.pipelines = [];
    this.pipelineNames = [];
    this.pipelineNameToGroupName = {};
    this.pipelinesPauseInfo = {};
    this.testResults = [];
    this.defaultSettings = {
      disabledPipelines: conf.defaultDisabledPipelines,
      sortOrder: conf.defaultSortOrder
    };
    this.pollingInterval = conf.goPollingInterval * 1000;
    // Refresh pipelines once every day
    this.checkPipelinesInterval = conf.goCheckPipelinesInterval * 1000;
    this.buildService = new GoBuildService(this.goConfig);
    this.testService = new GoTestService(this.goConfig);

    // Init db and settings
    this.dbService = new DBService(new Datastore({ filename: conf.dbFilePath, autoload: true }));

  }

  /**
   * Starts the service. Polls go server for pipeline and test results
   */
  start() {
    // Retrieve stored test results
    this._refreshAndNotifyTestResults();

    // Start polling go server for build and test results
    this.pollGoServer();
  }

  currentSettings(profile) {
    return this.dbService.getSettings(profile).then((doc) => {
      if (doc && doc.settings) {
        // saved settings exist, merge them with default settings
        return Object.assign({}, this.defaultSettings, doc.settings);
      } else if (profile !== null) {
        // no saved settings exist for a profile; fall back to settings for default profile
        return this.currentSettings(null)
      } else {
        // no settings exist for default profile; fall back to default settings from the config
        return this.defaultSettings
      }
    });
  }

  profileForClient(client) {
    return client.handshake.query.profile
  }

  pipelinesToIgnore() {
    return this.dbService.numberOfSettingsWithProfile().then((count) => {
      if (count > 0) {
        // we have multiple profiles, don't filter
        return []
      } else {
        // no profiles, ignore pipelines disabled in the default profile
        return this.currentSettings(null).then(settings => settings.disabledPipelines)
      }
    })
  }

  filterRegex() {
    return this.dbService.numberOfSettingsWithProfile().then((count) => {
      if (count > 0) {
        // we have multiple profiles, don't filter
        return ''
      } else {
        // no profiles, ignore pipelines disabled in the default profile
        return this.currentSettings(null).then(settings => settings.filterRegex)
      }
    })
  }

  pollGoServer() {
    // Function that refreshes all pipelines
    const refreshPipelines = (pipelineNames) => {
      let currentPipelines = [];
      Promise.all([this.pipelinesToIgnore(), this.filterRegex()]).then(([pipelinesToIgnore,filterRegex]) => {
        const pipelineFilterRegex = filterRegex || '';
        const pipelinesToFetch = pipelineNames
          .filter(p => pipelinesToIgnore.indexOf(p) < 0)
          .filter(p => p.match(pipelineFilterRegex));

        Logger.debug(`Refreshing pipeline status. Fetching: ${JSON.stringify(pipelinesToFetch)}; Ignoring: ${JSON.stringify(pipelinesToIgnore)} and everything not matching ${JSON.stringify(pipelineFilterRegex)}`)
        pipelinesToFetch.forEach((name) => {
          this.buildService.getPipelineHistory(name).then((pipeline) => {
            // Add pause information
            if (this.pipelinesPauseInfo[name] && pipeline) {
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
    const getPipelineGroups = () => {
      Logger.info('Retrieving pipeline groups');
      // Fetch the pipelines with pause info and start polling pipeline history
      this.buildService.getPipelineGroups()
        .then((pipelineGroups) => {
          let pipelineNameToGroupName = new Object();
          pipelineGroups.forEach((pipelineGroup) => {
            pipelineGroup.pipelines.map((pipeline) => {
              if (pipelineNameToGroupName[pipeline.name] == undefined) {
                pipelineNameToGroupName[pipeline.name] = pipelineGroup.name;
              }
            });
          });
          this.pipelineNameToGroupName = pipelineNameToGroupName;
          this.notifyAllClients('pipelineNameToGroupName:updated', pipelineNameToGroupName);
        })
        .catch((err) => {
          Logger.error('Failed to retrieve pipeline groups, retrying');
          Logger.error(err);
          // Wait a second before trying again
          setTimeout(getPipelineGroups, 1000);
        });
    };
    // Refresh pipeline names and poll every day for new
    const fullRefresh = () => {
      Logger.debug('Performing full refresh');
      if (conf.groupPipelines) {
        getPipelineGroups();
      }
      refreshPipelinesAndPollForUpdates();
    };
    fullRefresh();
    setInterval(fullRefresh, this.checkPipelinesInterval);

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

      const profile = this.profileForClient(client);

      // Emit latest pipeline names and settings
      client.emit('pipelines:names', this.pipelineNames);
      this.currentSettings(profile).then((settings) => {
        client.emit('settings:updated', settings);
      });

      if (conf.groupPipelines) {
        client.emit('pipelineNameToGroupName:updated', this.pipelineNameToGroupName);
      }

      // Register for setting updates
      client.on('settings:update', (settings) => {
        this.dbService.saveOrUpdateSettings(profile, settings).then((savedSettings) => {
          // Notify other clients about the update
          this.notifyAllClientsWithProfile(profile, 'settings:updated', savedSettings);
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

  /**
   * Emits an event to all registered clients with a particular profile name
   *
   * @param {string}  profile Name of the profile to look for
   * @param {string}  event   Name of the event
   * @param {Object}  data    The data to send
   */
  notifyAllClientsWithProfile(profile, event, data) {
    this.clients.filter((client) => {
      return this.profileForClient(client) === profile
    }).forEach((client) => {
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
