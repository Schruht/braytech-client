const { remote, ipcRenderer } = require('electron')

window.braytechClient = {
    setDiscordRichPresence(RPCObject) {
        ipcRenderer.send('setDiscordRichPresence', RPCObject)
    }
}