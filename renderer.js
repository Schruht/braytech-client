const { ipcRenderer, remote } = require('electron')
const path = require('path');
const Mousetrap = require('mousetrap');
const fs = require('fs');

var minButton, maxButton, restoreButton, reloadButton, moreButton, settingsButton, creditsButton, backButton, content, devToolsButton, reloadAppButton, xurButton, override

document.onreadystatechange = () => {
    if (document.readyState == 'interactive') {
        content = document.getElementById('main'),
            override = fs.readFileSync('override.css', 'utf8')

        if (getSettings().braytech_beta.value == true) {
            content.src = 'https://beta.braytech.org'
        } else {
            content.src = 'https://braytech.org'
        }

        content.addEventListener('dom-ready', function() {
            content.insertCSS(override)
        })

        content.addEventListener('new-window', (event) => {
            openInBrowser(event.url)
        })

    } else if (document.readyState == 'complete') {

        let window = remote.getCurrentWindow();

        minButton = document.getElementById('min'),
            maxButton = document.getElementById('max'),
            restoreButton = document.getElementById('restore'),
            closeButton = document.getElementById('close'),
            reloadButton = document.getElementById('reload'),
            moreButton = document.getElementById('more'),
            settingsButton = document.getElementById('settings'),
            creditsButton = document.getElementById('credits'),
            backButton = document.getElementById('back'),
            devToolsButton = document.getElementById('devTools'),
            reloadAppButton = document.getElementById('reloadApp'),
            xurButton = document.getElementById('xur')

        var shouldResetBackgroundColor = false

        Mousetrap.bind(['shift+ctrl+r', 'command+alt+r'], reloadContent)
        Mousetrap.bind(['ctrl+,', 'cmd+,'], openSettings)

        minButton.addEventListener('click', event => {
            window = remote.getCurrentWindow();
            window.minimize();
        });

        maxButton.addEventListener('click', event => {
            window = remote.getCurrentWindow();
            window.maximize();
            toggleMaxRestoreButtons();
        });

        restoreButton.addEventListener('click', event => {
            window = remote.getCurrentWindow();
            window.unmaximize();
            toggleMaxRestoreButtons();
        });

        toggleMaxRestoreButtons();
        window.on('maximize', toggleMaxRestoreButtons);
        window.on('unmaximize', toggleMaxRestoreButtons);

        closeButton.addEventListener('click', event => {
            window = remote.getCurrentWindow();
            window.close();
        });

        reloadButton.addEventListener('click', event => {
            reloadContent()
        })

        settingsButton.addEventListener('click', event => {
            openSettings();
        })

        backButton.addEventListener('click', back)

        creditsButton.addEventListener('click', event => {
            navigate(path.join(__dirname, 'pages/credits.html'))
            backstack = ['https://braytech.org']
        })

        devToolsButton.addEventListener('click', event => {
            toggleDevTools()
        })

        reloadAppButton.addEventListener('click', event => {
            reloadApp()
        })

        xurButton.addEventListener('click', event => {
            navigate('https://www.oldmatexur.com')
            backstack = ['https://braytech.org']
            document.getElementById('root').style.backgroundColor = '#102014'
            shouldResetBackgroundColor = true
        })

        moreButton.addEventListener('mouseenter', event => {
            if (getSettings().devmode.value == true) {
                devToolsButton.style.display = 'block'
                reloadAppButton.style.display = 'block'
            } else {
                devToolsButton.style.display = 'none'
                reloadAppButton.style.display = 'none'
            }
        })

        let date = new Date()
        let hours = (date.getHours() + date.getTimezoneOffset()) % 24
        let day = date.getDay() - (date.getHours() + date.getTimezoneOffset() < 0 ? 1 : 0)

        if ((day == 4 && hours >= 18) || day == 5 || day == 6 || day == 0 || (day == 1 && hours < 18)) {
            xurButton.style.display = 'block'
        }

        function toggleMaxRestoreButtons() {
            window = remote.getCurrentWindow();
            if (window.isMaximized()) {
                maxButton.style.display = 'none';
                restoreButton.style.display = 'block';
            } else {
                restoreButton.style.display = 'none';
                maxButton.style.display = 'block';
            }
        }

        var backstack = []
        backButton.enabled = false

        function navigate(file) {
            let currentContent = content.src
            backstack.push(currentContent)
            if (backstack.length === 1) {
                backButton.enable();
            }
            content.src = file
        }

        backButton.enable = function() {
            backButton.classList.remove('back-disabled');
            backButton.enabled = true
        }

        backButton.disable = function() {
            backButton.classList.add('back-disabled');
            backButton.enabled = false
        }

        function back() {
            if (backButton.enabled) {
                let target = backstack.pop()
                content.src = target
                if (shouldResetBackgroundColor) {
                    document.getElementById('root').style.backgroundColor = '#202020'
                    shouldResetBackgroundColor = false
                }
                if (backstack.length === 0) {
                    backButton.disable()
                }
            }
        }

        function reloadContent() {
            content.src = content.src;
        }

        function openSettings() {
            ipcRenderer.send('showSettings')
        }

        function reloadApp() {
            window = remote.getCurrentWindow()
            window.reload()
        }

        function toggleDevTools() {
            window = remote.getCurrentWindow()
            window.toggleDevTools()
        }
    }
};

function openInBrowser(url) {
    remote.shell.openExternal(url)
}

function getSettings() {
    return JSON.parse(fs.readFileSync('data/settings.json', 'utf8'));
}