const remote = require('electron').remote;
const path = require('path');
const fs = require('fs');

var settings;

document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        let window = remote.getCurrentWindow();

        const closeButton = document.getElementById('close'),
              list = document.getElementById('settings');

        settings = getSettings()

        for (key in settings) {
            let entry = settings[key]
            let element = document.createElement('li')
            element.classList.add('list-cell')
            element.innerHTML = `<span>${entry.displayname}</span>${settings.devmode.value == 'true' ? `<span class="cell-subtitle"> .${key}</span>` : ''}${inputFor(key, entry)}`
            list.appendChild(element)
        }

        closeButton.addEventListener('click', event => {
            window = remote.getCurrentWindow();
            window.close();
        });
    }

    function inputFor(key, setting) {
        switch (setting.type) {
            case 'switch':
                return `<input class="cell-accessory" type="checkbox" id="${key}" ${setting.value == 'true' ? 'checked' : ''}>`
            case 'button':
                return `<div class="cell-accessory settings-button-icon ${setting.value}"></div>`
            default:
                return `<span class="cell-accessory setting-value">${setting.value}</span>`
        }
    }
};

function getSettings() {
    return JSON.parse(fs.readFileSync('data/settings.json', 'utf8'));
}