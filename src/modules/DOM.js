class _ extends Function {
    constructor(doc) {
        super()
        this.doc = doc
    }

    onReady(handler) {
        let self = this
        self.doc.addEventListener('readystatechange', () => {
            if (self.doc.readyState === 'complete') {
                handler()
            }
        })
    }
}

module.exports = function (doc) {
    return new Proxy(new _(doc), {
        get: function (target, property) {
            let element = target.doc.getElementById(property)
            return element || target[property]
        }
    })
}