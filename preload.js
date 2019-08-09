const { remote, ipcRenderer } = require('electron')

window.braytechClient = {
    setDiscordRichPresence(RPCObject) {
        ipcRenderer.send('setDiscordRichPresence', RPCObject)
    },
    setClientTheme(theme) {
        ipcRenderer.send('setClientTheme', theme)
    },
    getSystemDarkMode() {
        return ipcRenderer.send('getSystemDarkMode')
    }
}