global.$ = function(readyState = 'complete', arg) {
    if (arg instanceof Function) {
        document.onreadystatechange = () => {
            if (document.readyState == readyState) {
                arg()
            }
        }
    } else {
        return document.querySelector(arg)
    }
}