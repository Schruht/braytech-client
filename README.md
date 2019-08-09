# Braytech Client

**A third (fourth?) party desktop wrapper for [justrealmilk](https://github.com/justrealmilk)'s braytech.org.**

## Client Features

The client exposes a number of native system features via the global `window.braytechClient` object.

### Discord RPC

The client can set a rich presence to be displayed on Discord. 

```javascript
window.braytechClient.setDiscordRichPresence({
    state: 'In a fireteam',
    details: 'Raid: Crown of Sorrows',
    largeImageKey: 'leviathan',
    largeImageText: 'The Leviathan',
    smallImageKey: 'hunter',
    smallImageText: 'Hunter, Level 50'
})
```
[List of all parameters](https://discordapp.com/developers/docs/rich-presence/how-to#updating-presence-update-presence-payload-fields)

---

### System Dark Mode

On MacOS, the client can detect whether the OS is in light or dark mode.

```javascript
if (window.braytechClient.getSystemDarkMode()) {
    ...
}
```