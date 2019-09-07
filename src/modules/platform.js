module.exports = {
    localize (string) {
        let controlKey = process.platform === 'darwin' ? 'cmd' : 'ctrl'
        let primaryModifier = process.platform === 'darwin' ? 'alt' : 'shift'
        let secondaryModifier = process.platform === 'darwin' ? 'shift' : 'alt'
        
        return string
                .replace('%c', controlKey)
                .replace('%a1', primaryModifier)
                .replace('%a2', secondaryModifier)
    },
    match (object) {
        return object[process.platform] || object.default
    }
}