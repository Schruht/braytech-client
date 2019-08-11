const {
    app,
    BrowserWindow,
    Menu,
    MenuItem,
    BrowserView,
    shell,
    ipcMain,
    systemPreferences
} = require('electron'),
    path = require('path'),
    config = require('./src/config.json'),
    discordRPC = require('discord-rich-presence')(config.discord.clientID);

let mainWindow
let settingsWindow

function createWindow() {
    let menuTemplate = [
        ...(process.platform === 'darwin' ? [{
            label: app.getName(),
            submenu: [
                { role: 'quit' }
            ]
        }] : [])
    ]

    let menu = Menu.buildFromTemplate(menuTemplate)

    Menu.setApplicationMenu(menu)

    mainWindow = new BrowserWindow({
        width: 1300,
        height: 855,
        title: 'Braytech Client',
        icon: path.join(__dirname, 'src/assets/icons/braytech-96.png'),
        frame: false,
        backgroundColor: '#202020',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        }
    })

    mainWindow.loadFile('./src/index/index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    });

    mainWindow.on('closed', () => {
        mainWindow = null
        settingsWindow = null
    });
}

function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 500,
        height: 800,
        parent: mainWindow,
        title: 'Settings',
        frame: false,
        show: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    settingsWindow.on('closed', () => {
        settingsWindow = null
    })

    settingsWindow.loadFile(path.join(__dirname, 'src/settings/settings.html'));

    settingsWindow.once('ready-to-show', () => {
        settingsWindow.show()
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function() {
    if (mainWindow === null) createWindow()
});

ipcMain.on('showSettings', (event, arg) => {
    if (typeof settingsWindow === 'undefined' || settingsWindow === null) {
        createSettingsWindow()
    }
});

ipcMain.on('setDiscordRichPresence', (event, arg) => {
    discordRPC.updatePresence(arg);
});

ipcMain.on('quit', event => {
    app.quit();
})