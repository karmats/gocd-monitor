import {describe, before, after, it} from 'mocha';
import fs from 'fs';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import GoService from '../server/services/GoService';
import Datastore from 'nedb';
import DBService from "../server/services/DBService";

describe('DBService spec', () => {

  // Chai setup
  chai.use(chaiAsPromised);
  const expect = chai.expect;

  let dataStore;
  let dbService;

  beforeEach(() => {
    dataStore = new Datastore();
    dbService = new DBService(dataStore);
  });

  describe('settings', () => {
    it('should return an empty object if no settings have been stored yet', () => {
      return expect(dbService.getSettings(undefined)).to.eventually.equal(null)
    });

    it('should return settings that have been stored before', () => {
      return dbService.saveOrUpdateSettings(undefined, {some: "data"}).then(() => {

        return expect(dbService.getSettings(undefined)).to.eventually.deep.include({settings: {some: "data"}})
      })
    });

    it('should return latest settings if settings have been written more than once', () => {
      return dbService.saveOrUpdateSettings(undefined, {some: "data"}).then(() => {
        return dbService.saveOrUpdateSettings(undefined, {some: "other-data"})
      }).then(() => {
        return expect(dbService.getSettings(undefined)).to.eventually.deep.include({settings: {some: "other-data"}})
      })
    });
    describe('converting old filterRegexProps data for compatibility', () => {
      it('should map active props to filterRegex', () => {
        return dbService.saveOrUpdateSettings(undefined, {
          filterRegexProps: {
            active: true,
            value: 'some-regex'
          }
        }).then(() => {
          return expect(dbService.getSettings(undefined)).to.eventually.deep.include({settings: {filterRegex: 'some-regex'}})
        })
      });

      it('should not map inactive props but still remove filterRegexProps', () => {
        return dbService.saveOrUpdateSettings(undefined, {
          filterRegexProps: {
            active: false,
            value: 'some-regex'
          }
        }).then(() => {
          return expect(dbService.getSettings(undefined)).to.eventually.deep.include({settings: {}})
        })
      });
    })
  });
});
