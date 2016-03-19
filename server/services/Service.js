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
    // Add client if not in clients list
    if (!this.clients.some(c => client.id === c.id)) {
      // Emit latest pipeline result
      client.emit('pipelines:update', this.pipelines);
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

}
