const DOM = require('../modules/DOM')(document),
      fs = require('fs'),
      path = require('path');

DOM.onReady(() => {
    const animation = DOM.animation

    document.documentElement.setAttribute(
        'data-theme',
        getSettings().clientTheme.value
    )

    var i = 0
    var widths = [20, 35, 35, 40, 50, 55, 60, 65, 65, 100]
    var autoScroll = true

    var interval = setInterval(() => {
        let block = document.createElement('div')
        block.classList.add('code-block')
        block.id = i
        let width = widths[Math.floor(Math.random() * widths.length)]
        animation.appendChild(block)
        animate(block, width)
        i++
        if (Math.random() > 0.6) {
            animation.appendChild(document.createElement('br'))
        }
    }, 400)
    
    function animate(block, width) {
    		setTimeout(() => {
                block.style.width = `${width}px`
        }, 0)
    }
})

function getSettings() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/settings.json'), 'utf8'))
}