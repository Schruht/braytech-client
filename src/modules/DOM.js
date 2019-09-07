function insert(target, parameter, position) {
    if (parameter instanceof Object) {
        target.insertAdjacentElement(position, parameter)
    } else {
        target.insertAdjacentHTML(position, parameter)
    }
}

function formatCSSIdentifier(cssIdentifier) {
    let strings = cssIdentifier.split('-')
    let res = Array.from(function* () {
        for (let string of strings) {
            yield string.charAt(0).toUpperCase() + string.slice(1)
        }
    }()).join('')
    return res.charAt(0).toLowerCase() + res.slice(1)
}

function Bindable(object) {
    object.bindings = []
    return new Proxy(object, {
        set: function (target, property, value) {
            for (binding of target.bindings.filter(binding => binding.sourceProperty === property)) {
                binding.target[binding.targetProperty] = binding.transformation(value)
            }
            target[property] = value
        },
        get: function (target, property) {
            if (property === 'bindings') {
                return target.bindings
            }
            return new PropertyBinding(target, property, target[property])
        }
    })
}

class PropertyBinding {
    constructor(sourceObject, identifier, value) {
        this.sourceObject = sourceObject
        this.identifier = identifier
        this.value = value
        this.transformation = e => e
    }

    get transform() {
        return (transformation) => {
            let propertyBinding = new PropertyBinding(this.sourceObject, this.identifier, this.value)
            propertyBinding.transformation = transformation
            return propertyBinding
        }
    }
}

class DOMCollectionPropertyCallable extends Function {
    constructor(array) {
        super()
        this.array = array
    }
}

const DOMCollectionEachPropertyHandler = {
    set: function (target, property, value) {
        for (let element of target.array) {
            element[property] = value
        }
    },
    get: function (target, property) {
        return new Proxy(new DOMCollectionPropertyCallable(Array.from(function* () {
            for (let element of target.array) {
                yield element[property]
            }
        }())), DOMCollectionEachPropertyHandler)
    },
    apply: function (target, ...args) {
        return Array.from(function* () {
            for (let element of target.array) {
                yield element.apply(...args)
            }
        }())
    }
}

const DOMCollectionAllPropertyHandler = {
    get: function (target, property) {
        return new Proxy(Array.from(function* () {
            for (let element of target) {
                yield element[property]
            }
        }()), DOMCollectionAllPropertyHandler)
    }
}

class DOMCollection extends Array {
    constructor(...elements) {
        super(...elements)
    }

    get first() {
        if (this.length < 1) {
            return null
        }
        return this[0]
    }

    get each() {
        return new Proxy(new DOMCollectionPropertyCallable(this), DOMCollectionEachPropertyHandler)
    }

    get all() {
        return new Proxy(this, DOMCollectionAllPropertyHandler)
    }

    get that() {
        return selector => DOMElement(this.find(element => element.matches(selector)))
    }

    get those() {
        return selector => new DOMCollection(...this.filter(element => element.matches(selector)))
    }
}

const DOMElement = element => element instanceof HTMLElement || element instanceof Document ? new Proxy(element, {
    get: function (target, property) {
        switch (property) {
            case 'onReady': return (handler) => {
                if (target instanceof Document) {
                    target.addEventListener('readystatechange', () => {
                        if (target.readyState === 'complete') handler()
                    })
                }
            }
            case 'get': return (selector) => {
                if (selector.charAt(0) === '#') return DOMElement(target.querySelector(selector))
                else {
                    return new DOMCollection(...function* () {
                        for (let element of target.querySelectorAll(selector)) {
                            yield DOMElement(element)
                        }
                    }())
                }
            }
            case 'first': return (selector) => DOMElement(target.querySelector(selector))
            case 'all': return (selector) => new DOMCollection(...function* () {
                for (let element of target.querySelectorAll(selector)) {
                    yield DOMElement(element)
                }
            }())
            case 'append': return (parameter) => {
                insert(target, parameter, 'beforeend')
                return DOMElement(target)
            }
            case 'prepend': return (parameter) => {
                insert(target, parameter, 'afterbegin')
                return DOMElement(target)
            }
            case 'before': return (parameter) => {
                insert(target, parameter, 'beforebegin')
                return DOMElement(target)
            }
            case 'after': return (parameter) => {
                insert(target, parameter, 'afterend')
                return DOMElement(target)
            }
            case 'css': return (...args) => {
                if (args.length === 1 && args[0] instanceof Object) {
                    for (let key of Object.keys(args[0])) {
                        target.style[formatCSSIdentifier(key)] = args[0][key]
                    }
                } else if (args.length === 2) {
                    target.style[formatCSSIdentifier(args[0])] = args[1]
                }
                return DOMElement(target)
            }
            case 'bindProperty': return (property, sourceProperty) => {
                let path = property.split('.')
                let targetProperty = path.splice(-1, 1)
                let object = target
                for (let prop of path) {
                    object = object[prop]
                }
                sourceProperty.sourceObject.bindings.push({
                    target: object,
                    targetProperty: targetProperty,
                    sourceProperty: sourceProperty.identifier,
                    transformation: sourceProperty.transformation
                })
                object[targetProperty] = sourceProperty.value
            }
            case 'unbindProperty': return (property, sourceObject) => {
                let path = property.split('.')
                let targetProperty = path.splice(-1, 1)
                let object = target
                for (let prop of path) {
                    object = object[prop]
                }
                let binding = sourceObject.bindings.find(e => {
                    e.target === object &&
                        e.targetProperty === targetProperty
                })
                let index = sourceObject.bindings.indexOf(binding)
                if (index > -1) {
                    sourceObject.bindings.splice(index)
                }
            }
            default:
                if (property in target) {
                    let prop = target[property]
                    if (prop instanceof Function) {
                        return (...args) => {
                            return DOMElement(prop.bind(target)(...args))
                        }
                    }
                    return DOMElement(prop)
                } else {
                    return DOMElement(target.getElementById(property))
                }
        }
    },
    set: function (target, property, value) {
        switch (property) {
            default:
                target[property] = value
                return true
        }
    }
}) : element

module.exports = {
    DOMElement,
    DOMCollection,
    Bindable
}