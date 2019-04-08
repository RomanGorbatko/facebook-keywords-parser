export default class Base {

    constructor(browser) {
        this.browser = browser

        this.defaultTimeout = 60e3
        this.defaultTypeDelay = 1e2
        // this.randomTimeout = Math.floor(Math.random() * (5e3 - 1e2 + 1)) + 1e2
    }

    setRequestBody(body) {
        this.body = body
    }

    randomTimeout(min, max) {
        if (min === undefined) {
            min = 500
        }

        if (max === undefined) {
            max = 9000
        }

        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    getRequestBody() {
        return this.body
    }
}