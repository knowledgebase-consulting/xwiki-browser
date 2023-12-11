const { app, Menu } = require('electron');
const isMac = process.platform === 'darwin';
const packageJson = require('../../package.json');
app.name = packageJson.build.productName;

function createMenu(createSettingsWindow, settingsWindow) {

    const template = [
        // { role: 'appMenu' }
        ...(isMac
        ? [{
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
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' },
            ]
            }]
        : []),
        {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            ...(isMac
            ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [
                    { role: 'startSpeaking' },
                    { role: 'stopSpeaking' }
                    ]
                }
                ]
            : [
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
                ])
        ]
        },
        {
        label: 'View',
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
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac
            ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
                ]
            : [
                { role: 'close' }
                ])
        ]
        },
 /*       {
        role: 'help',
        submenu: [
            {
            label: 'Learn More',
            click: async () => {
                const { shell } = require('electron')
                await shell.openExternal('https://electronjs.org')
            }
            }
        ]
        }*/
    ]
    
    if (isMac) {
        return Menu.buildFromTemplate(template);
    } else {
        Menu.setApplicationMenu(null);
    }
}

module.exports = { createMenu };