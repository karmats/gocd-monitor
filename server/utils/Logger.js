/**
 * Logger class for pretty console.log info
 */
export default class Logger {

  static debug(msg) {
    // Only log in development mode
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', msg);
    }
  }

  static info(msg) {
    this.log('info', msg);
  }

  static warn(msg) {
    this.log('warn', msg);
  }

  static error(msg) {
    this.log('error', msg);
  }

  static log(level, msg) {
    // Default blue
    let color = '\x1b[34m';
    switch(level) {
      case 'debug':
        // Cyan
        color = '\x1b[36m';
        break;
      case 'warn':
        // Yellow
        color = '\x1b[33m';
        break;
      case 'error':
        // Red
        color = '\x1b[31m';
        break;
    }
    console.log(`${color}%s\x1b[0m`, `[${new Date().toISOString()}] ${level.toUpperCase()} ${msg}`);
  }
}
