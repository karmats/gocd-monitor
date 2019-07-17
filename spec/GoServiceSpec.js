import { describe, before, after, it } from 'mocha';
import fs from 'fs';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import GoService from '../server/services/GoService';

describe('GoService spec', () => {

  // Chai setup
  chai.use(chaiAsPromised);
  const expect = chai.expect;

  const clientStub = () => {return {id: 'client1', on: () => {}, emit: () => {}, handshake: { query: { }}}};

  const goService = new GoService();

  describe('#constructor()', () => {

    it('should set properties when created', () => {
      expect(goService).to.be.ok;
      expect(goService.pollingInterval).to.be.a('number');
      expect(goService.pipelines).to.be.an('array');
      expect(goService.testResults).to.be.an('array');
      expect(goService.clients).to.be.an('array');
    });

  });

  describe('#(un)registerClient()', () => {

    it('should register a client', (done) => {
      expect(goService.clients).to.have.lengthOf(0);

      goService.registerClient(clientStub());
      expect(goService.clients).to.have.lengthOf(1);

      done();
    });

    it('should not register client if client is already registered', (done) => {
      let client = clientStub();

      goService.registerClient(client);
      expect(goService.clients).to.have.lengthOf(1);
      goService.registerClient(client);
      expect(goService.clients).to.have.lengthOf(1);

      done();
    });

    it('should unregister a client', (done) => {
      let client = clientStub();

      goService.registerClient(client);
      expect(goService.clients).to.have.lengthOf(1);

      goService.unregisterClient(client);
      expect(goService.clients).to.have.lengthOf(0);

      done();
    });

    it('should not affect client list if a client that does not exists is unregistered', (done) => {
      let client = clientStub();

      expect(goService.clients).to.have.lengthOf(0);
      goService.unregisterClient(client);
      expect(goService.clients).to.have.lengthOf(0);

      done();
    });

  });

});
