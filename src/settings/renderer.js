const { remote, ipcRenderer } = require('electron'),
    path = require('path'),
    fs = require('fs'),
    doc = require('../modules/DOM').DOMElement(document),
    settings = require('electron-settings')

const settingsDefinition = JSON.parse(fs.readFileSync(path.join(__dirname, '../../static/settings.json'), 'utf8'))

doc.onReady(function () {
    let window = remote.getCurrentWindow()

    const {
        closeButton,
        list
    } = doc

    document.documentElement.setAttribute('data-theme', settings.get('clientTheme'))

    for (var key in settingsDefinition) {
        list.appendChild(cellFor(key))
    }

    close.addEventListener('click', event => {
        window = remote.getCurrentWindow()
        window.close()
    })
})

function cellFor(key) {
    let entry = settingsDefinition[key]
    let type = entry.type
    let value = settings.get(key)
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
            let displayValue
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

function writeChange(DOMElement, key, newValue) {

    settings.set(key, newValue)

    if (DOMElement) {
        DOMElement.querySelectorAll('.accessory-picker-item').forEach((item) => {
            if (item.id === newValue) {
                item.classList.add('accessory-picker-item-active')
            } else {
                item.classList.remove('accessory-picker-item-active')
            }
        })
    }
    if (settingsDefinition[key].requiresCSSUpdate) {
        ipcRenderer.send('request-css-reload')

        document.documentElement.setAttribute(
            'data-theme',
            settings.get('clientTheme')
        )
        
        for (var link of document.querySelectorAll("link[rel=stylesheet]")) link.href = link.href.replace(/\?.*|$/, "?ts=" + new Date().getTime())
    }
}