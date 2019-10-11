import io from "socket.io-client";

// Use the host only, to support group URLs and pass on query parameters for configuration
const socket = io(window.location.protocol + "//" + window.location.host + window.location.search);

// Reconnects the socket
export function reconnect() {
  socket.disconnect();
  socket.connect();
}

// Settings
export function subscribeToSettingsUpdates(callback) {
  socket.on('settings:updated', callback);
}

export function unsubscribeToSettingsUpdates(callback) {
  socket.off('settings:updated', callback);
}

export function publishSettingsUpdate(newSettings) {
  socket.emit('settings:update', newSettings);
}

// Pipelines
export function subscribeToPipelineNames(callback) {
  socket.on('pipelines:names', callback);
}

export function unsubscribeToPipelineNames(callback) {
  socket.off('pipelines:names', callback);
}

export function subscribeToPipelineUpdates(callback) {
  socket.on('pipelines:updated', callback);
}

export function unsubscribeToPipelineUpdates(callback) {
  socket.off('pipelines:updated', callback);
}

export function subscribeToPipelineNameToGroupUpdates(callback) {
  socket.on('pipelineNameToGroupName:updated', callback);
}

export function unsubscribeToPipelineNameToGroupUpdates(callback) {
  socket.off('pipelineNameToGroupName:updated', callback);
}

export function publishPipelineNames() {
  socket.emit('pipelines:get');
}

// Test results
export function subscribeToTestResultUpdates(callback) {
  socket.on('tests:updated', callback);
}

export function unsubscribeToTestResultUpdates(callback) {
  socket.off('tests:updated', callback);
}

export function subscribeToTestMessage(callback) {
  socket.on('tests:message', callback);
}

export function unsubscribeToTestMessage(callback) {
  socket.off('tests:message', callback);
}

export function publishTestResults() {
  socket.emit('tests:get');
}

export function publishTestResultAdd(pipeline) {
  socket.emit('tests:add', pipeline);
}

export function publishTestResultRemove(id) {
  socket.emit('tests:remove', id);
}

// Server errors, for now only connection errors will be reported
export function subscribeToErrors(callback) {
  socket.on('connect_error', callback);
}

export function unsubscribeToErrors(callback) {
  socket.off('connect_error', callback);
}
