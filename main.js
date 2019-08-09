// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, MenuItem, BrowserView, shell, ipcMain } = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let settingsWindow

function createWindow() {

    let menuTemplate = []

    let menu = Menu.buildFromTemplate(menuTemplate)

    Menu.setApplicationMenu(menu)

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 850,
        icon: path.join(__dirname, 'assets/icons/braytech-96.png'),
        frame: false,
        backgroundColor: '#202020',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')
        // Open the DevTools.
        // mainWindow.webContents.openDevTools()

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
        settingsWindow = null
    })
}

function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 500,
        height: 800,
        parent: mainWindow,
        frame: false,
        show: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    settingsWindow.loadFile(path.join(__dirname, 'pages/settings.html'))

    settingsWindow.once('ready-to-show', () => {
        settingsWindow.show()
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

ipcMain.on('showSettings', (event, arg) => {
    createSettingsWindow()
})

ipcMain.on('setDiscordRPC', (event, arg) => {
    console.log('setDiscordRPC')
})