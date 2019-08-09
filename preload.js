const { remote, ipcRenderer } = require('electron')

window.braytechClient = {
    setDiscordRPC(RPCObject) {
        ipcRenderer.send('setDiscordRPC', RPCObject)
    }
}