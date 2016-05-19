import rp from 'request-promise';

import Logger from '../utils/Logger';
import * as conf from '../../app-config';
import Service from './Service';

export default class GoTestService extends Service {

  constructor() {
    super();
    this.baseUrl = conf.goServerUrl + '/go/api';
    this.user = conf.goUser;
    this.password = conf.goPassword;

    this.dbService.getTestResults().then(
    (testResults) => {
      this.testResults = testResults;
    },
    (error) => {
      Logger.error('Failed to get test results');
      this.testResults = {};
    });
  }

}
