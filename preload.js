const { contextBridge, ipcRenderer, app } = require('electron');

contextBridge.exposeInMainWorld('menuAPI', {
  getMenuItems: async () => {
    return await ipcRenderer.invoke('get-menu-items');
  },
  getMenuItemContent: async (menuItem) => {
    return await ipcRenderer.invoke('get-menu-item-content', menuItem);
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