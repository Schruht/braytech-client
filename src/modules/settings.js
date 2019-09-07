const fs = require('fs'),
    path = require('path')

module.exports.getSettings = function() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/settings.json'), 'utf8'))
}