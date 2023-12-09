const fs = require('fs');
const path = require('path');
const electron = require('electron');
const app = electron.app || electron.remote.app;

const logFilePath = path.join(app.getPath('userData'), 'app.log');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  fs.appendFileSync(logFilePath, logMessage);
}

module.exports = logToFile;
