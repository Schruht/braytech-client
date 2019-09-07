function Bindable(object) {
    object.bindings = []
    return new Proxy(object, {
        set: function (target, property, value) {
            for (binding of target.bindings.filter(binding => binding.sourceProperty === property)) {
                binding.target[binding.targetProperty] = value
            }
            target[property] = value
        },
        get: function (target, property) {
            if (property === 'bindings') {
                return target.bindings
            }
            return {
                parent: target,
                property: property,
                value: target[property]
            }
        }
    })
}

Object.prototype.bindProperty = function (property, sourceProperty, setOnInit = true) {
    sourceProperty.parent.bindings.push({
        target: this,
        targetProperty: property,
        sourceProperty: sourceProperty.property
    })
    if (setOnInit) {
        this[property] = sourceProperty.value
    }
}

module.exports = Bindable