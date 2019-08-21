class Toggle {
    constructor(activeClass, activeItem) {
        this.activeClass = activeClass
        this.activeItem = activeItem
    }
}

module.exports = new Proxy(Toggle, {
    set: function(target, property, value) {
        if(property === 'active') {
            let oldItem = target.activeItem
            target.activeItem = value

            oldItem.classList.remove(target.activeClass)
            target.activeItem.classList.add(target.activeClass)

            return true
        }

        target[property] = value
        return true
    }
})