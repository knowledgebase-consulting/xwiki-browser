// Const initialisieren
const { app, BrowserWindow, Menu, MenuItem, ipcMain } = require('electron');
const { createMenu } = require('./menu.js');
const { TrayGenerator }  = require('./resources/main/tray.js');
const { autoUpdater } = require('electron-updater');
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
    // Laden der Start-URL oder nutzen des Standards
    const settings = loadSettings();
    const startUrl = settings.xwikiServerUrl || 'https://unternehmens-wiki.de/';
    // Const für das Laden der preload
    const basePath = isDev ? __dirname : app.getAppPath();
    // Starten des Hauptfensters
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 900,
      fullscreen: settings.fullscreen || false,
      webPreferences: {
        preload: path.resolve(basePath, './build/preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    // Aufrufen der Startseite beim Start
    mainWindow.loadURL(startUrl).catch(error => {
      console.error('Fehler beim Laden der URL: ', error);
    });
    // Entfernen des Fensters beim Schließen
    mainWindow.on('closed', function () {
      mainWindow = null;
    });
    //Fehlerbehandlung
  } catch (error) {
    console.error('Fehler beim Erstellen des Hauptfensters: ', error);
  }
  // Electron-Update nutzen
  if (!process.mas) {
    autoUpdater.checkForUpdatesAndNotify();
  } 
}
// Funktion zum Erstellen des Einstellungsfensters
function createSettingsWindow() {
  try {
    // Const für das Laden der preload
    const basePath = isDev ? __dirname : app.getAppPath();
    // Größe des Hauptfensters abfragen
    const mainWindowBounds = mainWindow.getBounds();
    // Größe des Einstellungsfensters setzen
    const settingsWindowWidth = Math.min(800, mainWindowBounds.width * 0.8);
    const settingsWindowHeight = Math.min(600, mainWindowBounds.height * 0.8);
    // Einstellungsfenster anzeigen
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
    // Einstellungsfenster laden
    settingsWindow.loadFile('./resources/settings/html/settings.html').catch(error => {
      console.error('Fehler beim Laden der Einstellungsdatei: ', error);
    });
    //Fehlerbehandlung
  } catch (error) {
    console.error('Fehler beim Erstellen des Einstellungsfensters: ', error);
  }
}
// Event-Listener für die Electron-App
// Das Hauptfenster starten und das Menü laden
app.on('ready', () => {
  try {
    createMainWindow();
    const menu = createMenu(createSettingsWindow, settingsWindow);
    const Tray = new TrayGenerator(mainWindow);
    Tray.createTray();
    Menu.setApplicationMenu(menu);
  } catch (error) {
    console.error('Fehler beim App-Start: ', error);
  }
});
// Auf dem Mac das Fenster nur schließen aber nicht das Programm beenden
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
// Bei einem erneuten Starten das Fenster reaktivieren
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
// Beim Schließen des Einstellungsfensters dieses sauber beenden
ipcMain.on('close-settings-window', () => {
  if (settingsWindow) {
    settingsWindow.close();
    settingsWindow = null;
  }
});
// Vollbildeinstellungen speichern
ipcMain.on('set-fullscreen', (event, value) => {
  try {
    settings.fullscreen = value;
    saveSettings(settings);
  } catch (error) {
    console.error('Fehler beim Setzen des Vollbildmodus: ', error);
  }
});
// Vollbildeinstellungen laden und übergeben
ipcMain.handle('get-fullscreen-setting', async () => {
  return settings.fullscreen;
});
//Start-URL aus den Einstellungen speichern
ipcMain.handle('set-start-url', (event, url) => {
  try {
    settings.xwikiServerUrl = url;
    saveSettings(settings);
    return { status: 'success' };
  } catch (error) {
    console.error('Fehler beim Speichern der Start-URL:', error);
    return { status: 'error', message: error.message };
  }
});
//Die verfügbaren Menüpunkte in den Einstellngen laden
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
// Den Inhalt der Menüpunkte in den Einstellungen übergeben
ipcMain.handle('get-menu-item-content', async (event, menuItem) => {
  const basePath = isDev ? __dirname : app.getAppPath();
  const menuPath = path.resolve(basePath, './resources/settings/items');
  const packageJson = require('./package.json');
  const filePath = path.join(menuPath, `${menuItem}.html`);
  try {
    let content = await fs.promises.readFile(filePath, 'utf8');
    if (menuItem === 'informationen') {
      content = content.replace('[VERSION]', packageJson.version);
    }
    return content;
  } catch (error) {
    console.error(error);
    return '';
  }
});
// Laden der App-Version
ipcMain.handle('get-app-version', async () => {
  try {
    return app.getVersion();
  } catch (error) {
    console.error('Fehler beim Abrufen der App-Version: ', error);
    return '';
  }
});
// Laden der Start-URL aus den Nutzer-Einstellungen
ipcMain.handle('get-start-url', async () => {
  let settings = await loadSettings();
  return settings.xwikiServerUrl;
});
