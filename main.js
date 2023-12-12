// ----------------------------------------------------------------------------------------------------------
// Const initialisieren
const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } = require('electron');
const { createMenu } = require('./resources/main/menu.js');
const { autoUpdater } = require('electron-updater');
const isDev = require('electron-is-dev');
const process = require('process');
const path = require('path');
const fs = require('fs');
// ----------------------------------------------------------------------------------------------------------
// Überprüfen, ob es sich um eine macOS-Plattform handelt
const isMac = process.platform === 'darwin';
// Pfad für die Speicherung der Benutzereinstellungen
const settingsPath = path.join(app.getPath('userData'), 'settings.json');
//Logging
const logToFile = require('./resources/log/log.js');
// ----------------------------------------------------------------------------------------------------------
// Globale Referenzen auf die Haupt- und Einstellungsfenster
let mainWindow;
let settingsWindow;
let tray;
// ----------------------------------------------------------------------------------------------------------
// Benutzereinstellungen
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
// ----------------------------------------------------------------------------------------------------------
// Funktion zum Speichern der Benutzereinstellungen
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Fehler beim Speichern der Einstellungen: ', error);
  }
}
// ----------------------------------------------------------------------------------------------------------
// Funktion zum Erstellen des Hauptfensters
function createMainWindow() {
  try {
    // Laden der Start-URL oder nutzen des Standards
    const settings = loadSettings();
    const startUrl = settings.xwikiServerUrl;
    const defaultFilePath = path.join(__dirname, 'resources/main/html/index.html');
    const basePath = isDev ? __dirname : app.getAppPath();
    // Konfiguration des Hauptfensters
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 900,
      fullscreen: isMac ? settings.fullscreen : false,
      maximized: !isMac && settings.fullscreen,
      icon: path.resolve(basePath, './build/icon.png'),
      webPreferences: {
        preload: path.resolve(basePath, './build/preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    // Fenster maximieren, wenn nicht auf Mac und Vollbild eingestellt
    if (!isMac && settings.fullscreen) {
      mainWindow.maximize();
    }
    // Entscheiden, ob eine URL oder eine lokale Datei geladen wird
    if (startUrl) {
      mainWindow.loadURL(startUrl).catch(error => {
        console.error('Fehler beim Laden der URL: ', error);
      });
    } else {
      mainWindow.loadFile(defaultFilePath).catch(error => {
        console.error('Fehler beim Laden der lokalen Datei: ', error);
      });
    }
    // Event-Listener für das Schließen des Fensters
    mainWindow.on('closed', function () {
      mainWindow = null;
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Hauptfensters: ', error);
  }
  // Automatische Updates prüfen
  if (!process.mas) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}
// ----------------------------------------------------------------------------------------------------------
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
// ----------------------------------------------------------------------------------------------------------
// Tray
function createTray(mainWindow, createSettingsWindow) {
  try {
    const basePath = isDev ? __dirname : app.getAppPath();
    const iconPath = nativeImage.createFromPath(path.resolve(basePath, "./build/icon.png"));
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
};
function getWindowPosition (mainWindow, tray) {
  const windowBounds = mainWindow.getBounds();
  const trayBounds = tray.getBounds();
  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  );
  const y = Math.round(trayBounds.y + trayBounds.height);
  return { x, y };
};
// ----------------------------------------------------------------------------------------------------------
// Event-Listener für die Electron-App
// Das Hauptfenster starten und das Menü laden
app.on('ready', () => {
  try {
    createMainWindow();
    const menu = createMenu(createSettingsWindow, settingsWindow);
    if (!isMac) {
      createTray(mainWindow, createSettingsWindow);
    } else {
      Menu.setApplicationMenu(menu);
    }
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
// ----------------------------------------------------------------------------------------------------------
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
//Settings-Window öffnen
ipcMain.on('open-settings-window', () => {
  createSettingsWindow();
});
process.on('uncaughtException', (error) => {
  logToFile(`Unerwarteter Fehler: ${error.message}`);
});