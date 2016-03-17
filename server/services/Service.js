export default class Service {

  constructor() {
    this.clients = [];
    this.pipelines = [];
  }

  /**
   * Register new client listener
   * 
   * @param {Socket}  client  Socket client that will receive automatic updates
   */
  registerClient(client) {
    // Emit latest pipeline result
    client.emit('pipelines:update', this.pipelines);
    this.clients.push(client);
  }

  /**
   * Unregister client listener
   * 
   * @param {Socket}  client  Socket client that will no longer receive updates
   */
  unregisterClient(client) {
    this.clients = this.clients.filter((c) => client.id !== c.id);
  }

}
