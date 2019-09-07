const { ipcRenderer, remote } = require('electron'),
    path = require('path'),
    Mousetrap = require('mousetrap'),
    fs = require('fs'),
    xur = require('../modules/xur'),
    fancyConsole = require('../modules/console'),
    platform = require('../modules/platform'),
    settings = require('electron-settings'),
    {DOMElement, Bindable} = require('../modules/DOM')

const doc = DOMElement(document)

doc.onReady(function () {
    let browserWindow = remote.getCurrentWindow()

    const {
        content: webView,
        min: minButton,
        restore: restoreButton,
        closeButton,
        max: maxButton,
        reloadButton,
        moreButton,
        settingsButton,
        creditsButton,
        backButton,
        devToolsButton,
        reloadAppButton,
        xurButton,
        quitButton
    } = doc

    reloadButton.get('.shortcut-hint').first.innerHTML = platform.localize('%c + %a1 + r') 
    settingsButton.get('.shortcut-hint').first.innerHTML = platform.localize('%c + ,')
    reloadAppButton.get('.shortcut-hint').first.innerHTML = platform.localize('%c + r')
    quitButton.get('.shortcut-hint').first.innerHTML = platform.match({
        win32: 'alt + f4',
        darwin: 'cmd + q',
        default: ''
    })

    if (process.env.DEV) {
        fancyConsole.rainbow('You are in dev mode')
    }

    fancyConsole.ascii('WARNING!').then(() => {
        console.log(`If you're not sure what you're doing, do not enter anything into the console. It may break the client or expose you to unnecessary security risks.`)
    })

    let override = fs.readFileSync(path.join(__dirname, '../css/override.css'), 'utf8')

    if (settings.get('braytechBeta') === true) {
        webView.src = 'https://beta.braytech.org'
    } else {
        webView.src = 'https://braytech.org'
    }

    webView.addEventListener('dom-ready', () => {
        webView.insertCSS(override)
    })

    webView.addEventListener('new-window', (event) => {
        openInBrowser(event.url)
    })

    webView.addEventListener('console-message', (event) => {
        fancyConsole.log({
            sender: `WebView (${webView.src})`,
            message: event.message
        })
    })

    Mousetrap.bind(['shift+ctrl+r', 'command+alt+r'], reloadContent)
    Mousetrap.bind(['ctrl+,', 'cmd+,'], openSettings)
    Mousetrap.bind(['ctrl+r', 'cmd+r'], reloadApp)

    document.documentElement.setAttribute(
        'data-theme',
        settings.get('clientTheme')
    )

    minButton.addEventListener('click', event => {
        browserWindow = remote.getCurrentWindow()
        browserWindow.minimize()
    })

    maxButton.addEventListener('click', event => {
        browserWindow = remote.getCurrentWindow()
        browserWindow.maximize()
        toggleMaxRestores()
    })

    restoreButton.addEventListener('click', event => {
        browserWindow = remote.getCurrentWindow()
        browserWindow.unmaximize()
        toggleMaxRestores()
    })

    toggleMaxRestores()
    browserWindow.on('maximize', toggleMaxRestores)
    browserWindow.on('unmaximize', toggleMaxRestores)

    closeButton.addEventListener('click', event => {
        browserWindow = remote.getCurrentWindow()
        browserWindow.close()
    })

    reloadButton.addEventListener('click', reloadContent)

    settingsButton.addEventListener('click', event => {
        openSettings()
    })

    backButton.addEventListener('click', back)

    creditsButton.addEventListener('click', event => {
        navigate(path.join(__dirname, '../credits.html'))
        backstack = ['https://braytech.org']
    })

    devToolsButton.addEventListener('click', toggleDevTools)

    reloadAppButton.addEventListener('click', reloadApp)

    xurButton.addEventListener('click', event => {
        navigate('https://www.oldmatexur.com')
        backstack = ['https://braytech.org']
    })

    moreButton.addEventListener('mouseenter', event => {
        if (settings.get('devmode') === true) {
            devToolsButton.style.display = 'block'
            reloadAppButton.style.display = 'block'
        } else {
            devToolsButton.style.display = 'none'
            reloadAppButton.style.display = 'none'
        }
    })

    quitButton.addEventListener('click', () => {
        ipcRenderer.send('quit')
    })

    if (xur.isAround) {
        xurButton.style.display = 'block'
    }

    function toggleMaxRestores() {
        browserWindow = remote.getCurrentWindow()
        if (browserWindow.isMaximized()) {
            maxButton.style.display = 'none'
            restoreButton.style.display = 'block'
        } else {
            restoreButton.style.display = 'none'
            maxButton.style.display = 'block'
        }
    }

    var backstack = []
    backButton.enabled = false

    function navigate(file) {
        let currentContent = webView.src
        backstack.push(currentContent)
        if (backstack.length === 1) {
            backButton.enable()
        }
        webView.src = file
    }

    backButton.enable = function () {
        backButton.classList.remove('back-disabled')
        backButton.enabled = true
    }

    backButton.disable = function () {
        backButton.classList.add('back-disabled')
        backButton.enabled = false
    }

    function back() {
        if (backButton.enabled) {
            let target = backstack.pop()
            webView.src = target
            if (backstack.length === 0) {
                backButton.disable()
            }
        }
    }

    function reloadContent() {
        webView.src = webView.src
    }

    function openSettings() {
        ipcRenderer.send('showSettings')
    }

    function reloadApp() {
        browserWindow = remote.getCurrentWindow()
        browserWindow.reload()
    }

    function toggleDevTools() {
        browserWindow = remote.getCurrentWindow()
        browserWindow.toggleDevTools()
    }
})

function openInBrowser(url) {
    remote.shell.openExternal(url)
}

ipcRenderer.on('reload-css', (event) => {
    document.documentElement.setAttribute(
        'data-theme',
        settings.get('clientTheme')
    )
    for (var link of document.querySelectorAll("link[rel=stylesheet]")) link.href = link.href.replace(/\?.*|$/, "?ts=" + new Date().getTime())
})