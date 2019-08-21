class _ extends Function {
    constructor(doc) {
        super()
        this.doc = doc
    }

    get() {
        let indexedDOM = {}
        indexedDOM.recurrenceIndex = {}

        let dom = this.doc.getElementsByTagName('*')

        for (var element of dom) {
            let key = ''
            if (element.id) {
                indexedDOM[element.id] = element
            }
        }
        return indexedDOM
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
    let result = new _(doc)

    result.shorthand = new Proxy(result, {
        apply: function (target, thisArg, argArray) {
            if (argArray.length === 0) {
                return target.get()
            }
            if (argArray.length === 1 && typeof argArray[0] === 'function') {
                return target.onReady(argArray[0])
            }
        }
    })

    return result
}