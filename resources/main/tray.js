const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

class trayGenerator {
  constructor(mainWindow, createSettingsWindowFn) {
    this.tray = null;
    this.mainWindow = mainWindow;
    this.createSettingsWindow = createSettingsWindowFn;
  }

  getWindowPosition() {
    const windowBounds = this.mainWindow.getBounds();
    const trayBounds = this.tray.getBounds();
    const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
    const y = Math.round(trayBounds.y + trayBounds.height);
    return { x, y };
  }

  showWindow() {
    const position = this.getWindowPosition();
    this.mainWindow.setPosition(position.x, position.y, false);
    this.mainWindow.show();
    this.mainWindow.setVisibleOnAllWorkspaces(true);
    this.mainWindow.focus();
    this.mainWindow.setVisibleOnAllWorkspaces(false);
  }

  toggleWindow() {
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.showWindow();
    }
  }

  createTray() {
    try {
      const iconPath = path.join(__dirname, 'resources/images/icon.png');
      const icon = nativeImage.createFromPath(iconPath);
      this.tray = new Tray(icon);

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Einstellungen',
          click: () => this.createSettingsWindow()
        },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'quit' }
      ]);

      this.tray.setToolTip('Meine Electron-Anwendung');
      this.tray.setContextMenu(contextMenu);
      this.tray.on('click', () => this.toggleWindow());
    } catch (error) {
      console.error(`Fehler beim Erstellen des Tray: ${error.message}`);
    }
  }
}

module.exports = trayGenerator;
