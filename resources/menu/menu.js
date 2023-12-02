const { app, ipcRenderer, Menu, MenuItem } = require('electron');
const packageJson = require('../../package.json');
app.name = packageJson.build.productName;

function createMenu(createSettingsWindow, settingsWindow) {
    if (process.platform === 'darwin') {
        const template = [
            {
                label: app.name,
                submenu: [
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
                    { type: 'separator' },
                    {
                        role: 'services',
                        submenu: []
                    },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            },
            {
                label: 'Bearbeiten',
                submenu: [
                    {
                        label: 'Rückgängig',
                        accelerator: 'CmdOrCtrl+Z',
                        selector: 'undo:'
                    },
                    {
                        label: 'Wiederholen',
                        accelerator: 'Shift+CmdOrCtrl+Z',
                        selector: 'redo:'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Ausschneiden',
                        accelerator: 'CmdOrCtrl+X',
                        selector: 'cut:'
                    },
                    {
                        label: 'Kopieren',
                        accelerator: 'CmdOrCtrl+C',
                        selector: 'copy:'
                    },
                    {
                        label: 'Einfügen',
                        accelerator: 'CmdOrCtrl+V',
                        selector: 'paste:'
                    },
                    {
                        label: 'Alles auswählen',
                        accelerator: 'CmdOrCtrl+A',
                        selector: 'selectAll:'
                    }
                ]
            },
            {
            label: 'Anzeige',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
            },
            {
                label: '&Fenster',
                role: 'window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'close' }
                ]
            }
        ];

        Menu.setApplicationMenu(Menu.buildFromTemplate(template));

        } else {
            Menu.setApplicationMenu(null);
    }
}

module.exports = { createMenu };