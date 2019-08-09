# Braytech Client

**A third (fourth?) party desktop wrapper for [justrealmilk](https://github.com/justrealmilk)'s braytech.org.**

## Client Features

The client exposes a number of native system features to braytech.org via the global `window.braytechClient` object.

### Discord RPC

The client can set a rich presence to be displayed on Discord.

```javascript
window.braytechClient.setDiscordRPC({
    name: 'Destiny 2'
})
``` 