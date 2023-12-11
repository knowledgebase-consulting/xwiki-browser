const { Menu } = require('electron');

class TrayGenerator {
  constructor(mainWindow, createSettingsWindowFn, tray) {
    this.mainWindow = mainWindow;
    this.createSettingsWindow = createSettingsWindowFn;
    this.tray = tray;
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

module.exports = { TrayGenerator };
