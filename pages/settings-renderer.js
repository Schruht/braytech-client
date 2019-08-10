const remote = require('electron').remote;
const path = require('path');
const fs = require('fs');

var settings;

document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        let window = remote.getCurrentWindow();

        const closeButton = document.getElementById('close'),
              list = document.getElementById('settings');

        document.documentElement.setAttribute('data-theme', getSettings().clientTheme.value)

        settings = getSettings()

        for (key in settings) {
            let li = document.createElement('li')
            li.classList.add('list-cell')
            li.id = key
            li.innerHTML = cellFor(key)
            list.appendChild(li)
        }

        closeButton.addEventListener('click', event => {
            window = remote.getCurrentWindow();
            window.close();
        });
    }
}

function cellFor(key) {
    let entry = settings[key]
    let type = entry.type
    let value = entry.value
    let displayName = entry.displayName

    let accessory
    switch (entry.type) {
        case 'switch':
            accessory = `<input id="input-${key}" type="checkbox" class="accessory-checkbox" ${value ? 'checked' : ''}>`
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
                options += `<div class="accessory-dropdown-item${isActive ? ' accessory-dropdown-item-active' : ''}">${option.display}</div>`
            }
            accessory = `<div id="input-${key}" class="accessory-dropdown"><span class="accessory-dropdown-value">${displayValue}</span>${options}</div>`
            break
    }

    return `<span class="cell-title">${displayName}</span>${accessory}`
}

function getSettings() {
    return JSON.parse(fs.readFileSync('data/settings.json', 'utf8'));
}