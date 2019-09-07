const {
    app,
    BrowserWindow,
    Menu,
    MenuItem,
    BrowserView,
    shell,
    ipcMain,
    Tray
} = require('electron'),
    path = require('path'),
    fs = require('fs'),
    settings = require('electron-settings'),
    config = require('./src/config.json')

let mainWindow,
    settingsWindow,
    updaterWindow,
    tray = null

process.env.DEV = true
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true

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
        show: false,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        }
    })

    mainWindow.loadFile('./src/index/index.html')

    mainWindow.toggleDevTools()

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('close', (event) => {
        if (settings.get('tray') === true && !app.isQuitting) {
            event.preventDefault()
            mainWindow.hide()
            if (settingsWindow) {
                settingsWindow.close()
            }
            
        }
        return false
    })

    mainWindow.on('closed', () => {
        mainWindow = null
        settingsWindow = null
    })
}

function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 400,
        height: 450,
        parent: mainWindow,
        title: 'Settings',
        frame: false,
        show: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    settingsWindow.on('closed', () => {
        settingsWindow = null
    })

    settingsWindow.loadFile(path.join(__dirname, 'src/settings/settings.html'))

    settingsWindow.once('ready-to-show', () => {
        settingsWindow.show()
    })
}

function createUpdaterWindow() {
    updaterWindow = new BrowserWindow({
        width: 400,
        height: 600,
        title: 'Updating',
        frame: false,
        show: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    updaterWindow.on('closed', () => {
        updaterWindow = null
    })

    updaterWindow.loadFile(path.join(__dirname, 'src/updater/updater.html'))

    updaterWindow.once('ready-to-show', () => {
        updaterWindow.show()
    })
}

function initializeSettings() {
    let settingsDefinition = JSON.parse(fs.readFileSync(path.join(__dirname, './static/settings.json')))

    for (var key in settingsDefinition) {

        if (!settings.has(key)) {
            settings.set(key, settingsDefinition[key].default)
        }
    }
}

app.on('ready', () => {
    tray = new Tray(path.join(__dirname, 'src/assets/icons/trayicon.ico'))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Quit Braytech Client', click: function () {
                app.isQuitting = true
                app.quit();
            }
        }
    ])
    tray.on('click', () => {
        mainWindow.show()
    })
    tray.setToolTip('Braytech Client')
    tray.setContextMenu(contextMenu)

    createWindow()
    initializeSettings()
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin' && settings.get('tray') === false) {
        app.isQuitting = true
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) createWindow()
})

ipcMain.on('showSettings', () => {
    if (typeof settingsWindow === 'undefined' || settingsWindow === null) {
        createSettingsWindow()
    }
})

ipcMain.on('request-css-reload', () => {
    mainWindow.webContents.send('reload-css')
})

ipcMain.on('quit', () => {
    app.quit()
})