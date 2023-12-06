const { contextBridge, ipcRenderer, app } = require('electron');
//Übergabe der Menüpunkte im Einstellungsfenster
contextBridge.exposeInMainWorld('menuAPI', {
  getMenuItems: async () => {
    try {
      return await ipcRenderer.invoke('get-menu-items');
    } catch (error) {
      console.error('Fehler beim Abrufen der Menüpunkte: ', error);
      return [];
    }
  },
  // Übergabe der Inhalte der Menüpunkte des Einstellungsfensters
  getMenuItemContent: async (menuItem) => {
    try {
      return await ipcRenderer.invoke('get-menu-item-content', menuItem);
    } catch (error) {
      console.error('Fehler beim Abrufen des Inhalts eines Menüpunkts: ', error);
      return '';
    }
  }
});
// Verschiedene Handler für das Einstellungsfenster
contextBridge.exposeInMainWorld('electronAPI', {
  getStartUrl: async () => await ipcRenderer.invoke('get-start-url'),
  setStartUrl: async (url) => await ipcRenderer.invoke('set-start-url', url),
  getAppVersion: async () => await ipcRenderer.invoke('get-app-version'),
  openSettingsWindow: () => ipcRenderer.send('open-settings-window'),
  closeSettingsWindow: () => ipcRenderer.send('close-settings-window'),
  setFullscreen: (flag) =>  ipcRenderer.send('set-fullscreen', flag),
  getFullscreenSetting: async () => {
    return await ipcRenderer.invoke('get-fullscreen-setting');
  }
});
