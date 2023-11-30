const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('menuAPI', {
  getMenuItems: async () => {
    return await ipcRenderer.invoke('get-menu-items');
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  closeSettingsWindow: () => ipcRenderer.send('close-settings-window'),
  setFullscreen: (flag) => ipcRenderer.send('set-fullscreen', flag),
  getFullscreenSetting: (callback) => {
    ipcRenderer.send('get-fullscreen-setting');
    ipcRenderer.once('fullscreen-setting', (event, value) => callback(value));
  }
});