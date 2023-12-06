const { Tray, Menu } = require("electron");
const isMac = process.platform === 'darwin';
const path = require("path");
class TrayGenerator {
  constructor(mainWindow, createSettingsWindowFn) {
    this.tray = null;
    this.mainWindow = mainWindow;
    this.createSettingsWindow = createSettingsWindowFn;
  }
  getWindowPosition = () => {
    const windowBounds = this.mainWindow.getBounds();
    const trayBounds = this.tray.getBounds();
    const x = Math.round(
      trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
    );
    const y = Math.round(trayBounds.y + trayBounds.height);
    return { x, y };
  };
  showWindow = () => {
    const position = this.getWindowPosition();
    this.mainWindow.setPosition(position.x, position.y, false);
    this.mainWindow.show();
    this.mainWindow.setVisibleOnAllWorkspaces(true);
    this.mainWindow.focus();
    this.mainWindow.setVisibleOnAllWorkspaces(false);
  };
  toggleWindow = () => {
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.showWindow();
    }
  };
  rightClickMenu = () => {
    const menu = [
      {
        label: 'Einstellungen',
        click: () => {
          if (!settingsWindow || settingsWindow.isDestroyed()) {
              createSettingsWindow();
          } else {
              settingsWindow.show();
          }
          }
      },  
      {
        role: 'quit',
        accelerator: 'Command+Q',
      },
    ];
    this.tray.popUpContextMenu(Menu.buildFromTemplate(menu));
  };
  createTray = () => {
    const basePath = isDev ? __dirname : app.getAppPath();
    if (isMac) {
    this.tray = new Tray(path.resolve(basePath, "./resources/images/kbc-logo.png"));
    } else {
    this.tray = new Tray(path.resolve(basePath, "./resources/images/kbc-logo.ico"));
    }
    this.tray.setIgnoreDoubleClickEvents(true);
    this.tray.on("click", this.toggleWindow);
    this.tray.on("right-click", this.rightClickMenu);
  };
}
module.exports = { TrayGenerator };