let date = new Date();
let tzOffset = date.getTimezoneOffset() / 60;
let hours = (date.getHours() + tzOffset) % 24;
let day = date.getDay() - (date.getHours() + tzOffset < 0 ? 1 : 0);

class _ {
    get isAround() {
        let time = day * 24 + hours
        return (time >= 114 || time <= 42)
    }
}

module.exports = new _()