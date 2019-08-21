const { remote, ipcRenderer } = require('electron'),
    path = require('path'),
    fs = require('fs'),
    DOM = require('../modules/DOM')(document);

var settings;

DOM.onReady(function () {
    let window = remote.getCurrentWindow();

    const {
        close,
        list
    } = DOM;

    document.documentElement.setAttribute('data-theme', getSettings().clientTheme.value)

    settings = getSettings()

    for (key in settings) {
        list.appendChild(cellFor(key))
    }

    close.addEventListener('click', event => {
        window = remote.getCurrentWindow();
        window.close();
    });
})

function cellFor(key) {
    let entry = settings[key]
    let type = entry.type
    let value = entry.value
    let displayName = entry.displayName

    let li = document.createElement('li')
    li.classList.add('list-cell')
    li.id = key

    let accessory
    switch (entry.type) {
        case 'switch':
            accessory = `<input id="input-${key}" type="checkbox" class="accessory-checkbox" ${value ? 'checked' : ''} onclick="writeChange(null, '${key}', this.checked)">`
            break
        case 'pick':
            let options = ''
            let displayValue;
            for (optionKey in entry.options) {
                let option = entry.options[optionKey]
                let isActive = option.value === value
                if (isActive) {
                    displayValue = option.display
                }
                options += `<div class="accessory-picker-item${isActive ? ' accessory-picker-item-active' : ''}" id="${option.value}" onclick="writeChange(this.parentElement, '${key}', this.id)">${option.display}</div>`
            }
            accessory = `<div id="input-${key}" class="accessory-picker">${options}</div>`
            break
    }

    li.innerHTML = `<span class="cell-title">${displayName}</span>${accessory}`

    return li
}

function getSettings() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/settings.json'), 'utf8'));
}

function writeChange(DOMElement, key, newValue) {

    console.log(`DOMElement: ${DOMElement}, Key: ${key}, newValue: ${newValue}`)

    return new Promise(function (resolve, reject) {
        let settings = getSettings()
        let setting = settings[key]
        setting.value = newValue
        let settingsString = JSON.stringify(settings)

        if (DOMElement) {
            DOMElement.querySelectorAll('.accessory-picker-item').forEach((item) => {
                if (item.id === newValue) {
                    item.classList.add('accessory-picker-item-active')
                } else {
                    item.classList.remove('accessory-picker-item-active')
                }
            })
        }

        fs.writeFile(path.join(__dirname, '../../data/settings.json'), settingsString, 'utf8', (err) => {
            if (err)
                reject(err)
            else
                if (setting.requiresCSSUpdate) {
                    ipcRenderer.send('request-css-reload')

                    document.documentElement.setAttribute(
                        'data-theme',
                        getSettings().clientTheme.value
                    );
                    for (var link of document.querySelectorAll("link[rel=stylesheet]")) link.href = link.href.replace(/\?.*|$/, "?ts=" + new Date().getTime())
                }
            resolve()
        });
    })
}