const { app, BrowserWindow, Menu, MenuItem, ipcMain } = require('electron');
const { createMenu } = require('./resources/menu/menu.js');
/* const { autoUpdater } = require('electron-updater'); */
const isDev = require('electron-is-dev');
const process = require('process');
const path = require('path');
const fs = require('fs');

// Überprüfen, ob es sich um eine macOS-Plattform handelt
const isMac = process.platform === 'darwin';

// Pfad für die Speicherung der Benutzereinstellungen
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// Globale Referenzen auf die Haupt- und Einstellungsfenster
let mainWindow;
let settingsWindow;

// Laden der Benutzereinstellungen beim Start
let settings = loadSettings();

// Funktion zum Laden der Benutzereinstellungen
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const settingsData = fs.readFileSync(settingsPath, 'utf-8');
      return JSON.parse(settingsData);
    }
    return {};
  } catch (error) {
    console.error('Fehler beim Laden der Einstellungen: ', error);
    return {};
  }
}

// Funktion zum Speichern der Benutzereinstellungen
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Fehler beim Speichern der Einstellungen: ', error);
  }
}

// Funktion zum Erstellen des Hauptfensters
function createMainWindow() {
  try {
    const basePath = isDev ? __dirname : app.getAppPath();
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      fullscreen: settings.fullscreen || false,
      webPreferences: {
        preload: path.resolve(basePath, './build/preload.js'),
        contextIsolation: false,
        nodeIntegration: false
      }
    });

    mainWindow.loadURL('https://www.wielsch.xyz').catch(error => {
      console.error('Fehler beim Laden der URL: ', error);
    });
    mainWindow.on('closed', function () {
      mainWindow = null;
    });
    /* if (!process.mas) {
      autoUpdater.checkForUpdatesAndNotify();
    } */
  } catch (error) {
    console.error('Fehler beim Erstellen des Hauptfensters: ', error);
  }
}

// Funktion zum Erstellen des Einstellungsfensters
function createSettingsWindow() {
  try {
    const basePath = isDev ? __dirname : app.getAppPath();
    const mainWindowBounds = mainWindow.getBounds();
    const settingsWindowWidth = Math.min(800, mainWindowBounds.width * 0.8);
    const settingsWindowHeight = Math.min(600, mainWindowBounds.height * 0.8);
    settingsWindow = new BrowserWindow({
      width: settingsWindowWidth,
      height: settingsWindowHeight,
      x: mainWindowBounds.x + (mainWindowBounds.width - settingsWindowWidth) / 2,
      y: mainWindowBounds.y + (mainWindowBounds.height - settingsWindowHeight) / 2,
      parent: mainWindow,
      modal: true,
      show: true,
      webPreferences: {
        preload: path.resolve(basePath, './build/preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    settingsWindow.loadFile('./resources/settings/html/settings.html').catch(error => {
      console.error('Fehler beim Laden der Einstellungsdatei: ', error);
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Einstellungsfensters: ', error);
  }
}

// Event-Listener für die Electron-App
app.on('ready', () => {
  try {
    createMainWindow();
    const menu = createMenu(createSettingsWindow, settingsWindow);
    Menu.setApplicationMenu(menu);
  } catch (error) {
    console.error('Fehler beim App-Start: ', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  try {
    if (mainWindow === null) {
      createMainWindow();
    }
  } catch (error) {
    console.error('Fehler beim Reaktivieren der App: ', error);
  }
});


// IPC Event-Handler für die Kommunikation zwischen Renderer- und Hauptprozess
ipcMain.on('close-settings-window', () => {
  if (settingsWindow) {
    settingsWindow.close();
    settingsWindow = null;
  }
});

ipcMain.on('set-fullscreen', (event, value) => {
  try {
    settings.fullscreen = value;
    saveSettings(settings);
  } catch (error) {
    console.error('Fehler beim Setzen des Vollbildmodus: ', error);
  }
});

ipcMain.on('get-fullscreen-setting', (event) => {
  event.reply('fullscreen-setting', settings.fullscreen);
});

ipcMain.handle('get-menu-items', async (event) => {
  const basePath = isDev ? __dirname : app.getAppPath();
  const menuPath = path.resolve(basePath, './resources/settings/items');
  try {
    const files = await fs.promises.readdir(menuPath);
    return files.filter(file => file.endsWith('.html')).map(file => file.replace('.html', ''));
  } catch (error) {
    console.error(error);
    return [];
  }
});

ipcMain.handle('get-menu-item-content', async (event, menuItem) => {
  const basePath = isDev ? __dirname : app.getAppPath();
  const menuPath = path.resolve(basePath, './resources/settings/items');
  const packageJson = require('./package.json');
  const filePath = path.join(menuPath, `${menuItem}.html`);
  try {
    let content = await fs.promises.readFile(filePath, 'utf8');
    if (menuItem === 'information') {
      content = content.replace('[ELECTRON-VERSION]', app.getVersion());
      content = content.replace('[VERSION]', packageJson.version);
    }
    return content;
  } catch (error) {
    console.error(error);
    return '';
  }
});

ipcMain.handle('get-app-version', () => {
  try {
    return app.getVersion();
  } catch (error) {
    console.error('Fehler beim Abrufen der App-Version: ', error);
    return '';
  }
});

