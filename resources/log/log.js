const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const logFilePath = path.join(app.getPath('userData'), 'log.log');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  fs.appendFileSync(logFilePath, logMessage);
}

module.exports = logToFile;
