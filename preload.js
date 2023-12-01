const { contextBridge, ipcRenderer, app } = require('electron');

contextBridge.exposeInMainWorld('menuAPI', {
  getMenuItems: async () => {
    try {
      return await ipcRenderer.invoke('get-menu-items');
    } catch (error) {
      console.error('Fehler beim Abrufen der Menüpunkte: ', error);
      return [];
    }
  },
  getMenuItemContent: async (menuItem) => {
    try {
      return await ipcRenderer.invoke('get-menu-item-content', menuItem);
    } catch (error) {
      console.error('Fehler beim Abrufen des Inhalts eines Menüpunkts: ', error);
      return '';
    }
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  closeSettingsWindow: () => ipcRenderer.send('close-settings-window'),
  setFullscreen: (flag) => ipcRenderer.send('set-fullscreen', flag),
  getFullscreenSetting: (callback) => {
    ipcRenderer.send('get-fullscreen-setting');
    ipcRenderer.once('fullscreen-setting', (event, value) => callback(value));
  }
});
