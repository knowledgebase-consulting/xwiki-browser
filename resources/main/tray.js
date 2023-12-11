const { app, Tray, nativeImage, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const logToFile = require('../log/log.js');
const packageJson = require('../../package.json');
app.name = packageJson.build.productName;

let tray;

function createTray(mainWindow, createSettingsWindow) {
  try {
    const basePath = isDev ? __dirname : app.getAppPath();
    const iconPath = nativeImage.createFromPath(path.resolve(basePath, "../images/icon.png"));
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Einstellungen',
        click: () => createSettingsWindow()
      },
      { type: 'separator' },
      { role: 'quit', accelerator: 'Command+Q' },
    ]);

    tray.setContextMenu(contextMenu);
    tray.setIgnoreDoubleClickEvents(true);
    tray.on("click", () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        const position = getWindowPosition(mainWindow, tray);
        mainWindow.setPosition(position.x, position.y, false);
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (error) {
    logToFile(`Fehler beim Erstellen des Tray: ${error.message}`);
  }
}

 function getWindowPosition (mainWindow, tray) {
    const windowBounds = mainWindow.getBounds();
    const trayBounds = tray.getBounds();
    const x = Math.round(
      trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
    );
    const y = Math.round(trayBounds.y + trayBounds.height);
    return { x, y };
  };

module.exports = { createTray };